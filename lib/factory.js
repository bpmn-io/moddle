'use strict';

var forEach = require('lodash/collection/forEach'),
    isUndefined = require('lodash/lang/isUndefined'),
    size = require('lodash/collection/size');

var Base = require('./base');


function Factory(model, properties) {
  this.model = model;
  this.properties = properties;
}

module.exports = Factory;


Factory.prototype.createType = function(descriptor) {

  var model = this.model;

  var props = this.properties,
      prototype = Object.create(Base.prototype);

  // initialize default values
  forEach(descriptor.properties, function(p) {
    if (!p.isMany && p.default !== undefined) {
      prototype[p.name] = p.default;
    }
  });

  props.defineModel(prototype, model);
  props.defineDescriptor(prototype, descriptor);

  prototype.isValid = function() {
    var typeDescriptor = model.getElementDescriptor(model.getType(this.$type));

    var requiredNotSet = false;
    forEach(typeDescriptor.propertiesByName, function(property, name) {
      if (property.isRequired) {
        var val = this.get(name);
        if (property.isMany) {
          requiredNotSet = size(val) === 0;
        } else {
          requiredNotSet = isUndefined(val);
        }
        return !requiredNotSet;
      }
    }, this);

    return !requiredNotSet;
  }

  prototype.setUniquelyRequired = function() {
    var typeDescriptor = model.getElementDescriptor(model.getType(this.$type));

    forEach(typeDescriptor.propertiesByName, function(property, name) {
      if (property.isRequired && property.constraint && property.constraint.enum) {
        var enumerated = property.constraint.enum;
        if (enumerated.length == 1) {
          this.set(name, enumerated[0]);
        }
      }
    }, this);
  }

  var name = descriptor.ns.name;

  /**
   * The new type constructor
   */
  function ModdleElement(attrs) {
    props.define(this, '$type', { value: name, enumerable: true });
    props.define(this, '$attrs', { value: {} });
    props.define(this, '$parent', { writable: true });

    forEach(attrs, function(val, key) {
      this.set(key, val);
    }, this);
  }

  ModdleElement.prototype = prototype;

  ModdleElement.hasType = prototype.$instanceOf = this.model.hasType;

  // static links
  props.defineModel(ModdleElement, model);
  props.defineDescriptor(ModdleElement, descriptor);

  return ModdleElement;
};