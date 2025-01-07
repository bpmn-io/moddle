import {
  forEach,
  bind
} from 'min-dash';

import Base from './base.js';

/**
 * @typedef {{
 *   new(attrs: Record<string | number, any> | Array<any>): ModdleElement;
 *   prototype: ModdleElement;
 *   readonly $model: Moddle;
 *   readonly $descriptor: EffectiveDescriptor;
 * }} ModdleElementType
 *
 * @typedef {Base & {
 *   readonly $model: Moddle;
 *   readonly $descriptor: EffectiveDescriptor;
 *   readonly $type: Namespace['name'];
 *   readonly $attrs: Record<string, any>;
 *   $parent: ModdleElement | AnyModdleElement;
 *   hasType: Moddle['hasType'];
 *   $instanceOf: Moddle['hasType'];
 *   [key: string]: any;
 * }} ModdleElement
 */

/**
 * A model element factory.
 *
 * @param {Moddle} model
 * @param {Properties} properties
 */
export default function Factory(model, properties) {
  this.model = model;
  this.properties = properties;
}

/**
 * @param {EffectiveDescriptor} descriptor
 * @return {ModdleElementType}
 */
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

  var name = descriptor.ns.name;

  /**
   * The new type constructor
   */
  function ModdleElement(attrs) {
    props.define(this, '$type', { value: name, enumerable: true });
    props.define(this, '$attrs', { value: {} });
    props.define(this, '$parent', { writable: true });

    forEach(attrs, bind(function(val, key) {
      this.set(key, val);
    }, this));
  }

  ModdleElement.prototype = prototype;

  ModdleElement.hasType = prototype.$instanceOf = this.model.hasType;

  // static links
  props.defineModel(ModdleElement, model);
  props.defineDescriptor(ModdleElement, descriptor);

  return ModdleElement;
};