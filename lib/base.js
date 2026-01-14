/**
 * Moddle base element.
 */
export default function Base() { }

/**
 * @template { keyof this } K
 *
 * Get property value (typed)
 *
 * @overload
 *
 * @param {K} name
 *
 * @return { this[K] }
 */
/**
 * @template T
 *
 * Get property value
 *
 * @overload
 *
 * @param {string} name
 *
 * @return {T}
 */
/**
 * Get property value
 *
 * @overload
 *
 * @param {string} name
 *
 * @return {unknown}
 */
Base.prototype.get = function(name) {
  return this.$model.properties.get(this, name);
};

/**
 * @template { keyof this } K
 * @template { this[K] } V
 *
 * Set property value
 *
 * @overload
 *
 * @param {K} name
 * @param {V} value
 */
/**
 * @template { string } S
 *
 * Set property value
 *
 * @overload
 *
 * @param { S extends keyof this ? never : S } name
 * @param { any } value
 */
Base.prototype.set = function(name, value) {
  this.$model.properties.set(this, name, value);
};