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
 * Converters for built-in types from string representations
 */
var TYPE_CONVERTERS = {
  String: function(s) { return s; },
  Boolean: function(s) { return s === 'true'; },
  Integer: function(s) { return parseInt(s, 10); },
  Real: function(s) { return parseFloat(s); }
};

/**
 * Convert a type to its real representation
 * @param {string} type
 * @template T
 * @param {T} value
 * @return {T | boolean | number | string}
 */
export function coerceType(type, value) {

  var converter = TYPE_CONVERTERS[type];

  if (converter) {
    return converter(value);
  } else {
    return value;
  }
}

/**
 * Return whether the given type is built-in
 * @param {string} type
 * @return {boolean}
 */
export function isBuiltIn(type) {
  return !!BUILTINS[type];
}

/**
 * Return whether the given type is simple
 * @param {string} type
 * @return {boolean}
 */
export function isSimple(type) {
  return !!TYPE_CONVERTERS[type];
}