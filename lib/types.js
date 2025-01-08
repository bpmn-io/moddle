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
 * @typedef {'String'} StringType
 * @typedef {'Boolean'} BooleanType
 * @typedef {'Integer'} IntegerType
 * @typedef {'Real'} RealType
 * @typedef {'Element'} ElementType
 * @typedef {StringType | BooleanType | IntegerType | RealType} BuiltInSimpleType
 * @typedef {BuiltInSimpleType | ElementType} BuiltInType
 */

/**
 * Convert given value to string
 * @overload
 * @param {StringType} type
 * @param {*} value
 * @return {string}
 */
/**
 * Convert given value to boolean
 * @overload
 * @param {BooleanType} type
 * @param {*} value
 * @return {boolean}
 */
/**
 * Convert given value to number
 * @overload
 * @param {IntegerType | RealType} type
 * @param {*} value
 * @return {number}
 */
/**
 * Convert a type to its real representation
 * @todo need a template type for the given value and return
 * @overload
 * @param {Exclude<string,BuiltInSimpleType>} type
 * @param {any} value
 * @return {any}
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
 * @overload
 * @param {BuiltInType} type
 * @return {true}
 */
/**
 * Return whether the given type is built-in
 * @overload
 * @param {Exclude<string,BuiltInType>} type
 * @return {false}
 */
export function isBuiltIn(type) {
  return !!BUILTINS[type];
}

/**
 * Return true if the given type is simple
 * @overload
 * @param {BuiltInSimpleType} type
 * @return {true}
 */
/**
 * Return false the given type is not simple
 * @overload
 * @param {Exclude<string,BuiltInSimpleType>} type
 * @return {false}
 */
export function isSimple(type) {
  return !!TYPE_CONVERTERS[type];
}