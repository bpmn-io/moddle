var fs = require('fs');
var util = require('util');

var sax = require('sax');
var _ = require('lodash');

var Stack = require('../../util/Stack');
var logger = require('../../util/Logger');

/**
 * A parser that reads CMOF (http://www.omg.org/mof/) meta model descriptors
 * and provides them as a JSON model.
 *
 * @class adapter.cmof.Parser
 * 
 * @param {Object} options
 * @param {boolean} [options.clean=false] whether to clean redundant descriptor properties
 * @param {boolean} [options.strict=true] whether to parse the descriptors as strict XML (should almost always be true)
 */
function Parser(options) {

  /*jshint -W069*/

  var stack = new Stack();

  var parsers = {};

  var elementsById = {};
  var elementsByType = {};

  options = _.extend({
    clean: false,
    strict: true
  }, options || {});

  var prefixToNsMap = {
    'BPMN20.cmof': 'bpmn',
    'BPMNDI.cmof': 'bpmndi',
    'DC.cmof': 'dc',
    'DI.cmof': 'di'
  };

  var simpleTypes = {
    'DC.cmof#String': 'String',
    'DC.cmof#Boolean': 'Boolean',
    'DC.cmof#Integer': 'Integer',
    'DC.cmof#Real': 'Real',
    'http://schema.omg.org/spec/MOF/2.0/cmof.xml#String': 'String',
    'http://schema.omg.org/spec/MOF/2.0/cmof.xml#Boolean': 'Boolean',
    'http://schema.omg.org/spec/MOF/2.0/cmof.xml#Element': 'Element',
    'http://schema.omg.org/spec/MOF/2.0/cmof.xml#Integer': 'Integer'
  };

  var parsedTags = [ 'type', 'superClass', 'ownedMember', 'redefinedProperty', 'ownedEnd', 'cmof:Tag', 'cmof:Package', 'ownedAttribute', 'ownedLiteral' ];

  var parsedTypes = [ 'cmof:Class', 'cmof:Association', 'cmof:PrimitiveType', 'cmof:DataType', 'cmof:Package', 'cmof:Enumeration', 'cmof:Property'];

  var collectionMap = {
    'cmof:Class': 'types',
    'cmof:PrimitiveType': 'types',
    'cmof:DataType': 'types',
    'cmof:Association': 'associations',
    'cmof:Enumeration': 'emumerations'
  };

  function parseElement(node, context) {
    var value = {};

    _.forEach(node.attributes, function(val, key) {
      if (key.indexOf('xmi:') !== 0) {
        if (val === "true") {
          val = true;
        }
        if (val === "false") {
          val = false;
        }

        value[key] = val;
      }
    });

    value.id = node.attributes['xmi:id'];

    return value;
  }

  function replaceNs(str) {
    var split = str.split(/#/);

    if (split.length > 1) {
      split[0] = prefixToNsMap[split[0]] || split[0];
    }

    return split.join(":");
  }

  function parsePackage(node, context) {
    var value = parseElement(node, context),
        id = node.attributes['xmi:id'];

    elementsByType['cmof:Package'].push(value);
    elementsById[id] = value;

    value.uri = value.uri.replace(/-XMI$/, "");

    return value;
  }

  function parseMember(node, context) {
    var parent = stack.top(),
        value = parseElement(node, context),
        type = node.attributes['xmi:type'];
        id = value.id;

    var byType = elementsByType[type];

    if (!byType) {
      logger.error("[modelgen] unknown type", type);
    }

    // normalize superClass: 'Foo Bar' to superClass: [ 'Foo', 'Bar' ]
    if (value.superClass) {
      value.superClass = _.collect(value.superClass.split(/\s/), replaceNs);
    }

    byType.push(value);
    elementsById[id] = value;

    if (!parent) {
      logger.error("[modelgen] no parent", node);
    }

    var collection = collectionMap[type];

    parent[collection] = (parent[collection] || []);
    parent[collection].push(value);

    return value;
  }

  function parseProperty(node, context) {
    var parent = stack.top(),
        value = parseElement(node, context);

    var isMany,
        isAttr,
        isVirtual,
        isComposite = value.isComposite;

    if ((value.lower === '0' && !value.upper) ||
        (value.lower === undefined && value.upper === undefined)) {
      isMany = false;
    } else {
      isMany = true;
    }

    if (value.isDerived || value.isDerivedUnion) {
      isVirtual = true;
    }

    if (isMany || isComposite || isVirtual) {
      isAttr = false;
    } else {
      isAttr = true;
    }

    if (isAttr) {
      value.isAttr = isAttr;
    }

    if (isVirtual) {
      value.isVirtual = true;
    }
    
    if (isMany) {
      value.isMany = isMany;
    }

    if (value.type) {
      value.type = replaceNs(value.type);
    }

    if (value.association && !value.isComposite) {
      value.isReference = true;
    }

    if (options.clean) {
      delete value['lower'];
      delete value['upper'];
      delete value['isDerived'];
      delete value['isDerivedUnion'];
      delete value['isOrdered'];
      delete value['visibility'];
      delete value['isComposite'];

      delete value['datatype'];
    }

    if (!parent) {
      logger.error("[modelgen] no parent", node);
    }

    parent.properties = (parent.properties || []);
    parent.properties.push(value);

    return value;
  }

  function parseType(node, context) {

    var parent = stack.top(),
        value = null,
        primitive = node.attributes['xmi:type'] === 'cmof:PrimitiveType',
        ref = node.attributes['href'];

    value = simpleTypes[ref];

    if (!value) {
      value = ref;
    }

    if (!parent) {
      logger.error("[modelgen] no parent", node);
    }

    if (!ref) {
      logger.error('no type ref found: ', node);
      throw new Error('no type ref');
    }

    parent.type = replaceNs(value);

    // complex elements are never attributes (!)
    if (parent.isAttr && (!parent.isReference && !primitive)) {
      delete parent.isAttr;
    }

    return value;
  }

  function parseTag(node, context) {

    var value = parseElement(node, context),
        id = value.element,
        element = elementsById[id];

    if (!element) {
      throw new Error('referenced element <' + id + '> not processed yet');
    }

    if (value.name == 'org.omg.xmi.nsPrefix') {
      element.prefix = value.value;
    }

    return value;
  }

  function parseSuperClass(node, context) {

    var parent = stack.top(),
        value = null,
        ref = node.attributes['href'];

    value = simpleTypes[ref];

    if (!value) {
      value = ref;
    }

    if (!parent) {
      logger.error("[modelgen] no parent", node);
    }

    if (!ref) {
      logger.error('no type ref found: ', node);
      throw new Error('no type ref');
    }

    parent.superClass = [ replaceNs(value) ];

    return value;
  }

  function parseRedefine(node, context) {
    var parent = stack.top(),
        ref = node.attributes['href'];

    if (!parent) {
      logger.error("[modelgen] no parent", node);
    }

    if (!ref) {
      logger.error('no ref found: ', node);
      throw new Error('no type ref');
    }

    parent.redefines = replaceNs(ref).replace('-', '#');

    return {};
  }

  function parseLiteral(node, context) {
    var parent = stack.top(),
        value = parseElement(node, context);

    if (options.clean) {
      delete value['classifier'];
      delete value['enumeration'];
    }

    parent.literalValues = (parent.literalValues || []);
    parent.literalValues.push(value);

    return value;
  }

  function parseOwnedEnd(node, context) {
    var parent = stack.top(),
        value = parseElement(node, context);

    parent.ownedEnd = value;

    return value;
  }

  // initialize parsers / elementsByType
  parsedTypes.forEach(function(t) {
    elementsByType[t] = [];
  });

  parsedTags.forEach(function(t) {
    parsers[t] = parseElement;
  });

  parsers['cmof:Tag'] = parseTag;
  parsers['cmof:Package'] = parsePackage;
  parsers['ownedMember'] = parseMember;
  parsers['ownedEnd'] = parseOwnedEnd;
  parsers['ownedAttribute'] = parseProperty;
  parsers['redefinedProperty'] = parseRedefine;
  parsers['ownedLiteral'] = parseLiteral;
  parsers['superClass'] = parseSuperClass;
  parsers['type'] = parseType;

  function postProcess(result) {
    return result;
  }

  /**
   * Parse a file (i.e. file name) and build the model.
   * 
   * @param  {String}   file the file to parse
   * @param  {Function} done the callback function invoked with (err, result)
   */
  function parseFile(file, done) {

    // create stream
    var saxStream = sax.createStream(options.strict, options);

    saxStream.on("error", function (e) {
      // unhandled errors will throw, since this is a proper node
      // event emitter.
      logger.error("error!", e);
      // clear the error
      this._parser.error = null;
      this._parser.resume();

      // TODO: send to error callback
    });

    saxStream.on("opentag", function(node) {
      var name = node.name,
          value;

      if (parsedTags.indexOf(name) !== -1) {
        var parser = parsers[name];

        if (!parser) {
          throw new Error('[modelgen] no parser for tag <' + type + '>');
        }

        value = parser(node, this);
      }

      if (value) {
        stack.push(value);
      }
    });

    saxStream.on("closetag", function(nodeName) {
      if (parsedTags.indexOf(nodeName) !== -1) {
        stack.pop();
      }
    });

    saxStream.on('end', function() {

      var result = { byId: elementsById, byType: elementsByType };

      postProcess(result);
      done(null, result);
    });

    // pipe is supported, and it's readable/writable
    // same chunks coming in also go out.
    fs.createReadStream(file).pipe(saxStream);
  }

  return {
    parseFile: parseFile
  };
}


module.exports = Parser;
module.exports.Stack = Stack;