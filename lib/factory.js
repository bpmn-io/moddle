import {
  forEach,
  bind
} from 'min-dash';

import Base from './base.js';

/**
 * @typedef {import('./ns.js').Namespace} Namespace
 * @typedef {import('./moddle.js').default} Moddle
 * @typedef {import('./properties.js').default} Properties
 * @typedef {import('./registry.js').EffectiveDescriptor} EffectiveDescriptor
 * @typedef {import('./base.js').default} BaseElement
 * @typedef {import('./descriptor-builder.js').AnyTypeDescriptor} AnyTypeDescriptor
 */

/**
 * @template [T=Record<string,any>]
 * @typedef {{
 *   new(attrs?: Partial<T>): ModdleElement<T>;
 *   prototype: ModdleElement<T>;
 *   readonly $model: Moddle;
 *   readonly $descriptor: EffectiveDescriptor;
 * }} ModdleElementType
 */

/**
 * @template [T=Record<string,any>]
 * @typedef {BaseElement & T & {
 *   readonly $model: Moddle;
 *   readonly $descriptor: EffectiveDescriptor;
 *   readonly $type: Namespace['name'];
 *   readonly $attrs: Record<string, any>;
 *   $parent?: ModdleElement | AnyModdleElement;
 *   hasType: Moddle['hasType'];
 *   $instanceOf: Moddle['hasType'];
 * }} ModdleElement
 */

/**
 * @template [T=Record<string,any>]
 * @typedef {BaseElement & T & {
 *   $type: string;
 *   $instanceOf: (type: string) => boolean;
 *   $parent?: ModdleElement | AnyModdleElement;
 *   readonly $model: Moddle;
 *   readonly $descriptor: AnyTypeDescriptor;
 * }} AnyModdleElement
 */

/**
 * A model element factory.
 *
 * @param {Moddle} model
 * @param {Properties} properties
 */
export default function Factory(model, properties) {

  /**
   * @private
   */
  this.model = model;

  /**
   * @private
   */
  this.properties = properties;
}

/**
 * @template [T=Record<string,any>]
 * @param {EffectiveDescriptor} descriptor
 * @return {ModdleElementType<T>}
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
   *
   * @type { ModdleElementType }
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