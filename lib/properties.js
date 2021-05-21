/**
 * A utility that gets and sets properties of model elements.
 *
 * @param {Model} model
 */
export default function Properties(model) {
  this.model = model;
}


/**
 * Sets a named property on the target element.
 * If the value is undefined, the property gets deleted.
 *
 * @param {Object} target
 * @param {String} name
 * @param {Object} value
 */
Properties.prototype.set = function(target, name, value) {

  var property = this.model.getPropertyDescriptor(target, name);
  var propertyName = getPropertyName(target, name, property);

  if (isUndefined(value)) {

    // unset the property, if the specified value is undefined;
    // delete from $attrs (for extensions) or the target itself
    if (property) {
      delete target[propertyName];
    } else {
      delete target.$attrs[name];
    }
  } else {

    // set the property, defining well defined properties on the fly or simply
    // updating them in target.$attrs (for extensions)
    if (property) {
      if (propertyName in target) {
        target[propertyName] = value;
      } else {
        defineProperty(target, propertyName, property, value);
      }
    } else {
      target.$attrs[name] = value;
    }
  }
};


/**
 * Returns the named property of the given element
 *
 * @param  {Object} target
 * @param  {String} name
 *
 * @return {Object}
 */
Properties.prototype.get = function(target, name) {

  var property = this.model.getPropertyDescriptor(target, name);
  var propertyName = getPropertyName(target, name, property);

  if (!property) {
    return target.$attrs[name];
  }

  // check if access to collection property and lazily initialize it
  if (!target[propertyName] && property.isMany) {
    defineProperty(target, propertyName, property, []);
  }

  return target[propertyName];
};


/**
 * Define a property on the target element
 *
 * @param  {Object} target
 * @param  {String} name
 * @param  {Object} options
 */
Properties.prototype.define = function(target, name, options) {
  Object.defineProperty(target, name, options);
};


/**
 * Define the descriptor for an element
 */
Properties.prototype.defineDescriptor = function(target, descriptor) {
  this.define(target, '$descriptor', { value: descriptor });
};

/**
 * Define the model for an element
 */
Properties.prototype.defineModel = function(target, model) {
  this.define(target, '$model', { value: model });
};


function isUndefined(val) {
  return typeof val === 'undefined';
}


function getPropertyName(target, name, descriptor) {
  if (!target || !name || !descriptor)
    return undefined;

  var propertyName = descriptor.name;

  if (name.includes(':')) {
    var parts = name.split(':');

    if (parts[0] !== target.$descriptor.ns.prefix)
      propertyName = descriptor.ns.name;
  }

  return propertyName;
}

function defineProperty(target, name, property, value) {
  Object.defineProperty(target, name, {
    enumerable: !property.isReference,
    writable: true,
    value: value,
    configurable: true
  });
}
