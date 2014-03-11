var _ = require('lodash');

var Common = require('./Common'),
    logger = require('./util/Logger'),
    isPrimitive = Common.isSimpleType;
    parseNameNs = Common.parseNameNs;

var DESCRIPTOR = '$descriptor',
    MODEL = '$model',
    PACKAGE = '$pkg';

function $descriptor(type) {
  return type[DESCRIPTOR];
}

function $model(type) {
  return type[MODEL];
}

function $pkg(type) {
  return type[PACKAGE];
}

function $define(element, name, value) {
  Object.defineProperty(element, name, {
    value: value
  });
}

function $defineDescriptor(element, descriptor) {
  $define(element, DESCRIPTOR, descriptor);
}

function $defineModel(element, model) {
  $define(element, MODEL, model);
}

function $definePackage(element, pkg) {
  $define(element, PACKAGE, pkg);
}

//// BaseType implementation /////////////////////////////////////////////////

function BaseType(descriptor, model) {
  $defineDescriptor(this, descriptor);
  $defineModel(this, model);
}

BaseType.prototype.__getPropertyDescriptor = function(name) {
  return $descriptor(this).propertiesByName[name];
};

BaseType.prototype.get = function(name) {

  var property = this.__getPropertyDescriptor(name),
      propertyName;

  if (!property) {
    return this[name];
  }

  propertyName = property.name;

  // check if access to collection property and lazily initialize it
  if (!this[propertyName]) {
    if (property.isMany) {
      Object.defineProperty(this, propertyName, {
        enumerable: !property.isReference,
        writable: true,
        value: []
      });
    }
  }

  return this[propertyName];
};

BaseType.prototype.set = function(name, value) {
  var property = this.__getPropertyDescriptor(name);

  if (!property) {
    this.$attrs[name] = value;
  } else {
    Object.defineProperty(this, property.name, {
      enumerable: !property.isReference,
      writable: true,
      value: value
    });
  }
};

//// Model implementation /////////////////////////////////////////////////

/**
 * A model that can be used to create elements of a specific type.
 * 
 * @param {Array<Package>} packages  the packages to contain
 * @param {Object} options  additional options to pass to the model
 */
function Model(packages, options) {

  var modelInstance = {};

  var packageMap = {};
  var elementsByName = {};

  var typeCache = {};

  options = _.extend({ defaultId: 'id', generateIdProperty: true }, options || {});

  function getElementByName(name) {
    return elementsByName[name];
  }

  function createType(descriptor) {
    var proto = new BaseType(descriptor, modelInstance);

    // early initialize default values via prototype
    
    _.forEach(descriptor.properties, function(p) {
      if (!p.isMany && p.default !== undefined) {
        proto[p.name] = p.default;
      }
    });

    function ModelElement(attrs) {

      var descriptor = $descriptor(this);

      Object.defineProperty(this, '$attrs', {
        value: {}
      });

      Object.defineProperty(this, '$type', {
        value: descriptor.ns.name,
        enumerable: true
      });

      _.forEach(attrs, function(val, key) {
        this.set(key, val);
      }, this);
    }

    ModelElement.prototype = proto;

    // static accessor of the model descriptor
    $defineModel(ModelElement, modelInstance);
    $defineDescriptor(ModelElement, descriptor);

    ModelElement.isA = function(name) {
      return !!_.find($descriptor(this).allTypes, function(t) {
        return t.name == name;
      });
    };

    return ModelElement;
  }

  function init() {
    _.forEach(packages, function(pkg) {
      var prefix = pkg.prefix;

      packageMap[pkg.uri] = pkg;
      packageMap[pkg.prefix] = pkg;

      function registerType(t) {

        // namespace types
        var typeNs = parseNameNs(t.name, prefix),
            nsName = typeNs.name;

        _.extend(t, {
          ns: typeNs,
          name: nsName
        });

        elementsByName[nsName] = t;

        // add back link to package
        $definePackage(t, pkg);

        t.propertiesByName = {};

        _.forEach(t.properties, function(p) {

          // namespace property names
          var propertyNs = parseNameNs(p.name, typeNs.prefix),
              propertyName = propertyNs.name;

          // namespace property types
          if (!isPrimitive(p.type)) {
            var propertyTypeNs = parseNameNs(p.type, propertyNs.prefix);
            p.type = propertyTypeNs.name;
          }

          _.extend(p, {
            ns: propertyNs,
            name: propertyName
          });

          t.propertiesByName[propertyNs.name] = p;
        });
      }

      _.forEach(pkg.types, registerType);
    });
  }

  function collectEffectiveTypes(nameNs, result) {

    var type = elementsByName[nameNs.name];

    if (!type) {
      logger.error('Unknown type <' + nameNs.name + '>');
      throw new Error('Unknown type: <' + nameNs.name + '>');
    }

    _.forEach(type.superClass, function(cls) {
      var parentNs = parseNameNs(cls, nameNs.prefix);
      collectEffectiveTypes(parentNs, result);
    });

    result.push(type);

    return result;
  }

  function getEffectiveDescriptor(type) {

    var nameNs = parseNameNs(type);

    // filter types for uniqueness
    var allTypes = _.unique(collectEffectiveTypes(nameNs, []));

    function redefineProperty(descriptor, p) {
      var nsPrefix = p.ns.prefix;
      var parts = p.redefines.split('#');

      var name = parseNameNs(parts[0], nsPrefix);
      var attrName = parseNameNs(parts[1], name.prefix).name;

      var redefinedProperty = descriptor.propertiesByName[attrName];
      if (!redefinedProperty) {
        logger.error('[model] ' + type + ' : property <' + attrName + '> redefined by <' + p.ns.name + '> does not exist');

        throw new Error('[model] refined property not found');
      } else {
        replaceProperty(descriptor, redefinedProperty, p);
      }

      delete p.redefines;
    }

    function addProperty(descriptor, p, idx) {
      addNamedProperty(descriptor, p, true);

      var properties = descriptor.properties;

      if (idx !== undefined) {
        properties.splice(idx, 0, p);
      } else {
        properties.push(p);
      }
    }

    function replaceProperty(descriptor, oldProperty, newProperty) {
      var oldNameNs = oldProperty.ns,
          props = descriptor.properties,
          propsByName = descriptor.propertiesByName;

      if (oldProperty.isBody) {

        if (!newProperty.isBody) {
          throw new Error(
            '[model] property <' + newProperty.ns.name + '> must be body property ' +
            'to refine <' + oldProperty.ns.name + '>');
        }

        // TODO: Check compatibility
        setBodyProperty(descriptor, newProperty, false);
      }

      addNamedProperty(descriptor, newProperty, true);

      // replace old property at index with new one
      var idx = props.indexOf(oldProperty);
      if (idx == -1) {
        throw new Error('[model] property <' + oldNameNs.name + '> not found in property list');
      }

      props[idx] = newProperty;

      // replace propsByName entry with new property
      propsByName[oldNameNs.name] = newProperty;
      propsByName[oldNameNs.localName] = newProperty;
    }

    function addNamedProperty(descriptor, p, validate) {
      var ns = p.ns,
          propsByName = descriptor.propertiesByName;

      if (validate) {
        assertNotDefined(descriptor, p, ns.name);
        assertNotDefined(descriptor, p, ns.localName);
      }

      propsByName[ns.name] = p;
      propsByName[ns.localName] = p;
    }

    function setBodyProperty(descriptor, p, validate) {

      if (descriptor.bodyProperty) {
        throw new Error(
          '[model] body property defined multiple times ' +
          '(<' + descriptor.bodyProperty.ns.name + '>, <' + p.ns.name + '>)');
      }

      descriptor.bodyProperty = p;
    }

    function removeNamedProperty(descriptor, p) {
      var ns = p.ns,
          propsByName = descriptor.propertiesByName;

      delete propsByName[ns.name];
      delete propsByName[ns.localName];
    }

    function createIdProperty(descriptor) {
      var nameNs = parseNameNs(options.defaultId, descriptor.ns.prefix);

      var idProperty = {
        name: nameNs.localName,
        type: 'String',
        isAttr: true,
        ns: nameNs
      };

      // ensure that id is always the first attribute (if present)
      addProperty(descriptor, idProperty, 0);
    }

    function assertNotDefined(descriptor, property, name) {
      var propertyName = property.name,
          definedProperty = descriptor.propertiesByName[propertyName];

      if (definedProperty) {
        console.error('[model] property <', propertyName, '> already defined. Override of <', definedProperty.definedBy, '>#<', definedProperty, '> by <', property.definedBy, '>#<', property, '> not allowed without redefines.');
        throw new Error('[model] property <' + propertyName + '> already defined. Override of <' + definedProperty.definedBy.ns.name + '>#<' + definedProperty.ns.name + '> by <' + property.definedBy.ns.name + '>#<' + property.ns.name + '> not allowed without redefines.');
      }
    }

    function needsId(descriptor) {
      return options.generateIdProperty && !descriptor.propertiesByName[options.defaultId];
    }

    var descriptor = { name: nameNs.name, ns: nameNs, allTypes: allTypes, properties: [], propertiesByName: {}, constraints: [] };
    var last = _.last(allTypes);

    $definePackage(descriptor, $pkg(last));
    
    allTypes.forEach(function(t) {
      (t.properties || []).forEach(function(p) {

        // clone property to allow extensions
        p = _.extend({}, p);

        //if (p.ns.prefix === descriptor.ns.prefix) {
          // remove prefix if namespace == type namespace
          p.name = p.ns.localName;
        //}

        Object.defineProperty(p, 'definedBy', {
          value: t
        });

        // add redefine support
        if (p.redefines) {
          redefineProperty(descriptor, p);
        } else {
          if (p.isBody) {
            setBodyProperty(descriptor, p);
          }
          addProperty(descriptor, p);
        }
      });

      (t.constraints || []).forEach(function(c) {
        descriptor.constraints.push(c);
      });
    });

    if (needsId(descriptor)) {
      // create default ns id property unless it exists
      // confirms with the general schema abilities of xml / json
      createIdProperty(descriptor);
    }

    return descriptor;
  }

  function getPackage(uriOrPrefix) {
    return packageMap[uriOrPrefix];
  }

  function getPackages() {
    return _.clone(packages);
  }

  function getType(descriptor) {

    var name = _.isString(descriptor) ? descriptor : descriptor.ns.name;

    var type = typeCache[name];

    if (!type) {
      descriptor = getEffectiveDescriptor(name);
      type = typeCache[descriptor.name] = createType(descriptor);
    }

    return type;
  }

  function create(descriptor, attrs) {

    var type = getType(descriptor);

    var instance = new type(attrs);

    return instance;
  }
  
  init();

  return _.extend(modelInstance, {
    create: create,
    getDescriptor: $descriptor,
    getType: getType,
    getPackage: getPackage,
    getPackages: getPackages
  });
}

module.exports = Model;