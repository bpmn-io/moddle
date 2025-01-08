import {
  pick,
  assign,
  forEach,
  bind
} from 'min-dash';

import {
  parseName as parseNameNs
} from './ns.js';

/**
 * @typedef {import('./ns').Namespace} Namespace
 * @typedef {import('./registry').RegisteredTypeDef} RegisteredTypeDef
 * @typedef {import('./registry').RegisteredPropertyDef} RegisteredPropertyDef
 */

/**
 * Type descriptor
 * @typedef {ReturnType<DescriptorBuilder['build']>} Descriptor
 */

/**
 * Property descriptor
 * @typedef {RegisteredPropertyDef & {
 *   localName: Namespace['localName'];
 *   inherited: boolean;
 *   definedBy: RegisteredTypeDef;
 * }} PropertyDesc
 */

/**
 * @typedef {{
 *   name: string;
 *   isGeneric: true;
 *   ns: {
 *     prefix: string;
 *     localName: string;
 *     uri: string;
 *   };
 * }} AnyTypeDescriptor
 */

/**
 * A utility to build element descriptors.
 * @class DescriptorBuilder
 * @param {Namespace} nameNs
 */
export default function DescriptorBuilder(nameNs) {

  /**
   * @type {Namespace}
   */
  this.ns = nameNs;

  /**
   * @type {Namespace['name']}
   */
  this.name = nameNs.name;

  /**
   * @type {RegisteredTypeDef[]}
   */
  this.allTypes = [];

  /**
   * @type {Record<string, RegisteredTypeDef>}
   */
  this.allTypesByName = {};

  /**
   * @type {Array<PropertyDesc>}
   */
  this.properties = [];

  /**
   * @type {Record<string, PropertyDesc>}
   */
  this.propertiesByName = {};
}

DescriptorBuilder.prototype.build = function() {
  return pick(this, [
    'ns',
    'name',
    'allTypes',
    'allTypesByName',
    'properties',
    'propertiesByName',
    'bodyProperty',
    'idProperty'
  ]);
};

/**
 * Add property at given index.
 *
 * @param {PropertyDesc} p
 * @param {Number} [idx]
 * @param {Boolean} [validate=true]
 */
DescriptorBuilder.prototype.addProperty = function(p, idx, validate) {

  if (typeof idx === 'boolean') {
    validate = idx;
    idx = undefined;
  }

  this.addNamedProperty(p, validate !== false);

  var properties = this.properties;

  if (idx !== undefined) {
    properties.splice(idx, 0, p);
  } else {
    properties.push(p);
  }
};

/**
 * @param {PropertyDesc} oldProperty
 * @param {PropertyDesc} newProperty
 * @param {string} replace
 */
DescriptorBuilder.prototype.replaceProperty = function(oldProperty, newProperty, replace) {
  var oldNameNs = oldProperty.ns;

  var props = this.properties,
      propertiesByName = this.propertiesByName,
      rename = oldProperty.name !== newProperty.name;

  if (oldProperty.isId) {
    if (!newProperty.isId) {
      throw new Error(
        'property <' + newProperty.ns.name + '> must be id property ' +
        'to refine <' + oldProperty.ns.name + '>');
    }

    this.setIdProperty(newProperty, false);
  }

  if (oldProperty.isBody) {

    if (!newProperty.isBody) {
      throw new Error(
        'property <' + newProperty.ns.name + '> must be body property ' +
        'to refine <' + oldProperty.ns.name + '>');
    }

    // TODO: Check compatibility
    this.setBodyProperty(newProperty, false);
  }

  // validate existence and get location of old property
  var idx = props.indexOf(oldProperty);
  if (idx === -1) {
    throw new Error('property <' + oldNameNs.name + '> not found in property list');
  }

  // remove old property
  props.splice(idx, 1);

  // replacing the named property is intentional
  //
  //  * validate only if this is a "rename" operation
  //  * add at specific index unless we "replace"
  //
  this.addProperty(newProperty, replace ? undefined : idx, rename);

  // make new property available under old name
  propertiesByName[oldNameNs.name] = propertiesByName[oldNameNs.localName] = newProperty;
};

/**
 * @param {PropertyDesc} p
 * @param {string} targetPropertyName
 * @param {string} replace
 */
DescriptorBuilder.prototype.redefineProperty = function(p, targetPropertyName, replace) {

  var nsPrefix = p.ns.prefix;
  var parts = targetPropertyName.split('#');

  var name = parseNameNs(parts[0], nsPrefix);
  var attrName = parseNameNs(parts[1], name.prefix).name;

  var redefinedProperty = this.propertiesByName[attrName];
  if (!redefinedProperty) {
    throw new Error('refined property <' + attrName + '> not found');
  } else {
    this.replaceProperty(redefinedProperty, p, replace);
  }

  delete p.redefines;
};

/**
 * @param {PropertyDesc} p
 * @param {boolean} validate
 */
DescriptorBuilder.prototype.addNamedProperty = function(p, validate) {
  var ns = p.ns,
      propsByName = this.propertiesByName;

  if (validate) {
    this.assertNotDefined(p, ns.name);
    this.assertNotDefined(p, ns.localName);
  }

  propsByName[ns.name] = propsByName[ns.localName] = p;
};

/**
 * @param {RegisteredPropertyDef} p
 */
DescriptorBuilder.prototype.removeNamedProperty = function(p) {
  var ns = p.ns,
      propsByName = this.propertiesByName;

  delete propsByName[ns.name];
  delete propsByName[ns.localName];
};

/**
 * @param {PropertyDesc} p
 * @param {boolean} [validate]
 */
DescriptorBuilder.prototype.setBodyProperty = function(p, validate) {

  if (validate && this.bodyProperty) {
    throw new Error(
      'body property defined multiple times ' +
      '(<' + this.bodyProperty.ns.name + '>, <' + p.ns.name + '>)');
  }

  this.bodyProperty = p;
};

/**
 * @param {PropertyDesc} p
 * @param {boolean} [validate]
 */
DescriptorBuilder.prototype.setIdProperty = function(p, validate) {

  if (validate && this.idProperty) {
    throw new Error(
      'id property defined multiple times ' +
      '(<' + this.idProperty.ns.name + '>, <' + p.ns.name + '>)');
  }

  this.idProperty = p;
};

/**
 * @param {RegisteredTypeDef} typeDescriptor
 */
DescriptorBuilder.prototype.assertNotTrait = function(typeDescriptor) {

  const _extends = typeDescriptor.extends || [];

  if (_extends.length) {
    throw new Error(
      `cannot create <${ typeDescriptor.name }> extending <${ typeDescriptor.extends }>`
    );
  }
};

/**
 * @param {PropertyDesc} p
 */
DescriptorBuilder.prototype.assertNotDefined = function(p, name) {
  var propertyName = p.name,
      definedProperty = this.propertiesByName[propertyName];

  if (definedProperty) {
    throw new Error(
      'property <' + propertyName + '> already defined; ' +
      'override of <' + definedProperty.definedBy.ns.name + '#' + definedProperty.ns.name + '> by ' +
      '<' + p.definedBy.ns.name + '#' + p.ns.name + '> not allowed without redefines');
  }
};

/**
 * @param {string} name
 * @return {PropertyDesc}
 */
DescriptorBuilder.prototype.hasProperty = function(name) {
  return this.propertiesByName[name];
};

/**
 * @param {RegisteredTypeDef} t
 * @param {boolean} inherited
 */
DescriptorBuilder.prototype.addTrait = function(t, inherited) {

  if (inherited) {
    this.assertNotTrait(t);
  }

  var typesByName = this.allTypesByName,
      types = this.allTypes;

  var typeName = t.name;

  if (typeName in typesByName) {
    return;
  }

  forEach(t.properties, bind(function(p) {

    // clone property to allow extensions
    p = assign({}, p, {
      name: p.ns.localName,
      inherited: inherited
    });

    Object.defineProperty(p, 'definedBy', {
      value: t
    });

    var replaces = p.replaces,
        redefines = p.redefines;

    // add replace/redefine support
    if (replaces || redefines) {
      this.redefineProperty(p, replaces || redefines, replaces);
    } else {
      if (p.isBody) {
        this.setBodyProperty(p);
      }
      if (p.isId) {
        this.setIdProperty(p);
      }
      this.addProperty(p);
    }
  }, this));

  types.push(t);
  typesByName[typeName] = t;
};