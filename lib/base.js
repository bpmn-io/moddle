/**
 * Moddle base element.
 */
export default function Base() { }

/**
 * Get property value
 * @param {string} name
 * @return {*}
 */
Base.prototype.get = function(name) {
  return this.$model.properties.get(this, name);
};

/**
 * Set property value
 * @param {string} name
 * @param {*} value
 */
Base.prototype.set = function(name, value) {
  this.$model.properties.set(this, name, value);
};