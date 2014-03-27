
function parseNameNs(name, defaultPrefix) {
  var parts = name.split(/:/),
      localName, prefix;

  // no prefix (i.e. only local name)
  if (parts.length == 1) {
    localName = name;
    prefix = defaultPrefix;
  } else
  // prefix + local name
  if (parts.length == 2) {
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

var BUILD_IN_TYPES = {
  'String': true,
  'Boolean': true,
  'Integer': true,
  'Real': true,
  'Element': true,
};

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

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function lower(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

function aliasToName(alias, pkg) {
  if (pkg.alias === 'lowerCase') {
    return capitalize(alias);
  } else {
    return alias;
  }
}

function nameToAlias(name, pkg) {
  if (pkg.alias === 'lowerCase') {
    return lower(name);
  } else {
    return name;
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

module.exports.aliasToName = aliasToName;
module.exports.nameToAlias = nameToAlias;