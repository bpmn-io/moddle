'use strict';

/**
 * Built-in moddle types
 */
var BUILTINS = {
  String: true,
  Boolean: true,
  Integer: true,
  Real: true,
  Element: true
};

/**
 * Converters for built in types from string representations
 */
var TYPE_CONVERTERS = {
  String: function(s) { return s; },
  Boolean: function(s) { return s === 'true'; },
  Integer: function(s) { return parseInt(s, 10); },
  Real: function(s) { return parseFloat(s, 10); }
};

var TYPE_CHECKERS = {
  String: function(s) { return typeof s === 'string'; },
  Boolean: function(b) { return typeof b === 'boolean'; },
  Integer: function(i) { return typeof i === 'number' && i % 1 === 0; },
  Real: function(r) { return typeof r === 'number'; },
  Element: function(e) { return true; }
};

/**
 * Convert a type to its real representation
 */
module.exports.coerceType = function(type, value) {

  var converter = TYPE_CONVERTERS[type];

  if (converter) {
    return converter(value);
  } else {
    return value;
  }
};

module.exports.checkBuiltInType = function(type, value) {
  return TYPE_CHECKERS[type](value);
};

/**
 * Return whether the given type is built-in
 */
module.exports.isBuiltIn = function(type) {
  return !!BUILTINS[type];
};

/**
 * Return whether the given type is simple
 */
module.exports.isSimple = function(type) {
  return !!TYPE_CONVERTERS[type];
};