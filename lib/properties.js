import {
  assign,
  isArray,
  isString
} from 'min-dash';

import { isSimple } from './types.js';

/**
 * @typedef {import('./moddle.js').default} Moddle
 * @typedef {import('./descriptor-builder.js').PropertyDescriptor} PropertyDesc
 * @typedef {import('./registry.js').EffectiveDescriptor} EffectiveDescriptor
 * @typedef {import('./factory.js').ModdleElement} ModdleElement
 * @typedef {import('./descriptor-builder.js').AnyTypeDescriptor} AnyTypeDescriptor
 */

/**
 * A utility that gets and sets properties of model elements.
 *
 * @param {Moddle} model
 */
export default function Properties(model) {

  /** @type {Moddle} */
  this.model = model;
}

/**
 * Sets a named property on the target element.
 * If the value is undefined, the property gets deleted.
 *
 * For contained (non-reference) properties, new values get the target
 * as their `$parent`; replaced or removed values get their `$parent`
 * unset, unless they point to another parent or are still contained
 * in the target.
 *
 * @param {ModdleElement} target
 * @param {String} name
 * @param {Object} value
 */
Properties.prototype.set = function(target, name, value) {

  if (!isString(name) || !name.length) {
    throw new TypeError('property name must be a non-empty string');
  }

  var property = this.getProperty(target, name);

  var propertyName = property && property.name;

  var oldValue = property && target[propertyName];

  if (isUndefined(value)) {

    // unset the property, if the specified value is undefined;
    // delete from $attrs (for extensions) or the target itself
    if (property) {
      delete target[propertyName];

      updateParent(target, property, oldValue, value);
    } else {
      delete target.$attrs[stripGlobal(name)];
    }
  } else {

    // set the property, defining well defined properties on the fly
    // or simply updating them in target.$attrs (for extensions)
    if (property) {
      if (propertyName in target) {
        target[propertyName] = value;
      } else {
        defineProperty(target, property, value);
      }

      updateParent(target, property, oldValue, value);
    } else {
      target.$attrs[stripGlobal(name)] = value;
    }
  }
};

/**
 * Returns the named property of the given element
 *
 * @param  {ModdleElement} target
 * @param  {String} name
 *
 * @return {Object}
 */
Properties.prototype.get = function(target, name) {

  var property = this.getProperty(target, name);

  if (!property) {
    return target.$attrs[stripGlobal(name)];
  }

  var propertyName = property.name;

  // check if access to collection property and lazily initialize it
  if (!target[propertyName] && property.isMany) {
    defineProperty(target, property, []);
  }

  return target[propertyName];
};

/**
 * Define a property on the target element
 * @template [T=any]
 * @param  {NonNullable<T>} target
 * @param  {String} name
 * @param  {PropertyDescriptor} options
 */
Properties.prototype.define = function(target, name, options) {

  if (!options.writable) {

    var value = options.value;

    // use getters for read-only variables to support ES6 proxies
    // cf. https://github.com/bpmn-io/internal-docs/issues/386
    options = assign({}, options, {
      get: function() { return value; }
    });

    delete options.value;
  }

  Object.defineProperty(target, name, options);
};

/**
 * Define the descriptor for an element
 * @template [T=any]
 * @param {NonNullable<T>} target
 * @param {EffectiveDescriptor | AnyTypeDescriptor} descriptor
 */
Properties.prototype.defineDescriptor = function(target, descriptor) {
  this.define(target, '$descriptor', { value: descriptor });
};

/**
 * Define the model for an element
 * @template [T=any]
 * @param {NonNullable<T>} target
 * @param {Moddle} model
 */
Properties.prototype.defineModel = function(target, model) {
  this.define(target, '$model', { value: model });
};

/**
 * Return property with the given name on the element.
 *
 * @param {ModdleElement} target
 * @param {string} name
 *
 * @return {PropertyDesc | null} property
 */
Properties.prototype.getProperty = function(target, name) {

  var model = this.model;

  var property = model.getPropertyDescriptor(target, name);

  if (property) {
    return property;
  }

  if (name.includes(':')) {
    return null;
  }

  const strict = model.config.strict;

  if (typeof strict !== 'undefined') {
    const error = new TypeError(`unknown property <${ name }> on <${ target.$type }>`);

    if (strict) {
      throw error;
    } else {

      typeof console !== 'undefined' && console.warn(error);
    }
  }

  return null;
};

function isUndefined(val) {
  return typeof val === 'undefined';
}

function defineProperty(target, property, value) {
  Object.defineProperty(target, property.name, {
    enumerable: !property.isReference,
    writable: true,
    value: value,
    configurable: true
  });
}

function stripGlobal(name) {
  return name.replace(/^:/, '');
}

/**
 * Update `$parent` of the old and new values of a contained property:
 * new values get `target` as their parent; old values get their parent
 * unset, unless they point to another parent or are still contained
 * in `target`.
 *
 * Referenced values are left untouched.
 *
 * @param {ModdleElement} target
 * @param {PropertyDesc} property
 * @param {any} oldValue
 * @param {any} newValue
 */
function updateParent(target, property, oldValue, newValue) {

  if (!isContainment(property)) {
    return;
  }

  var contained;

  forEachElement(oldValue, function(element) {

    if (element.$parent !== target) {
      return;
    }

    contained = contained || getContainedElements(target);

    if (!contained.has(element)) {
      element.$parent = undefined;
    }
  });

  forEachElement(newValue, function(element) {
    element.$parent = target;
  });
}

/**
 * @param {PropertyDesc} property
 *
 * @return {boolean}
 */
function isContainment(property) {
  return !property.isReference && !isSimple(property.type);
}

/**
 * Get all elements contained in any property of `target`.
 *
 * @param {ModdleElement} target
 *
 * @return {Set<ModdleElement>}
 */
function getContainedElements(target) {
  var contained = new Set();

  target.$descriptor.properties.forEach(function(property) {

    if (!isContainment(property)) {
      return;
    }

    forEachElement(target[property.name], function(element) {
      contained.add(element);
    });
  });

  return contained;
}

/**
 * Invoke `fn` for each model element in the given value(s).
 *
 * @param {any} value
 * @param {(element: ModdleElement) => void} fn
 */
function forEachElement(value, fn) {
  var values = isArray(value) ? value : [ value ];

  values.forEach(function(value) {
    if (isModdleElement(value)) {
      fn(value);
    }
  });
}

/**
 * @param {any} value
 *
 * @return {boolean}
 */
function isModdleElement(value) {
  return !!value && !!value.$descriptor;
}
