'use strict';

/**
 * Parses a namespaced attribute name of the form (ns:)localName to an object,
 * given a default prefix to assume in case no explicit namespace is given.
 */
function parseNameNs(name, defaultPrefix) {
  var parts = name.split(/:/),
      localName, prefix;

  // no prefix (i.e. only local name)
  if (parts.length === 1) {
    localName = name;
    prefix = defaultPrefix;
  } else
  // prefix + local name
  if (parts.length === 2) {
    localName = parts[1];
    prefix = parts[0];
  } else {
    throw new Error('expected <prefix:localName> or <localName>');
  }

  name = (prefix ? prefix + ':' : '') + localName;

  return {
    name: name,
    prefix: prefix,
    localName: localName
  };
}

/**
 * Built in moddle types
 */
var BUILD_IN_TYPES = {
  'String': true,
  'Boolean': true,
  'Integer': true,
  'Real': true,
  'Element': true,
};

/**
 * Converters for built in types from string representations
 */
var TYPE_CONVERTERS = {
  'String': function(s) { return s; },
  'Boolean': function(s) { return s === 'true'; },
  'Integer': function(s) { return parseInt(s, 10); },
  'Real': function(s) { return parseFloat(s, 10); }
};

function coerceType(type, value) {

  var converter = TYPE_CONVERTERS[type];

  if (converter) {
    return converter(value);
  } else {
    return value;
  }
}

function isBuiltInType(type) {
  return !!BUILD_IN_TYPES[type];
}

function isSimpleType(type) {
  return !!TYPE_CONVERTERS[type];
}

module.exports.coerceType = coerceType;
module.exports.isBuiltInType = isBuiltInType;
module.exports.isSimpleType = isSimpleType;
module.exports.parseNameNs = parseNameNs;