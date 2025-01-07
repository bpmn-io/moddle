import {
  isString,
  isObject,
  forEach,
  set
} from 'min-dash';

import Factory from './factory.js';
import Registry from './registry.js';
import Properties from './properties.js';

import {
  parseName as parseNameNs
} from './ns.js';

/**
 * Package definition
 * @typedef {{
 *   $schema?: string;
 *   name: string;
 *   prefix: string;
 *   types: Array<TypeDef>;
 *   [key: string]: any;
 * } & PackageDefXmlExtension} PackageDef
 */

/**
 * @typedef {{
 *   uri: string;
 *   xml?: {
 *     tagAlias?: 'lowerCase';
 *     typePrefix?: string;
 *   };
 * }} PackageDefXmlExtension
 */

/**
 * Type definition in declaration in package
 * @typedef {{
 *   name: string;
 *   isAbstract?: boolean;
 *   properties?: Array<PropertyDef>;
 *   superClass?: Array<string>;
 *   extends?: Array<string>;
 *   meta?: Record<string, *>;
 *   [key: string]: any;
 * }} TypeDef
 */

/**
 * @typedef {{
 *   isBody?: boolean;
 *   isAttr?: boolean;
 *   xml?: {
 *     serialize?: string;
 *   };
 * }} PropertyDefXmlExtension
 */

/**
 * Property definition of type definition
 * @typedef {{
 *   name: string;
 *   type: 'String' | 'Boolean' | 'Integer' | 'Real' | string;
 *   default?: string | boolean | number;
 *   isMany?: boolean;
 *   isReference?: boolean;
 *   isId?: boolean;
 *   redefines?: string;
 *   replaces?: string;
 *   [key: string]: any;
 * } & PropertyDefXmlExtension} PropertyDef
 */

/**
 * @typedef {{
 *   name: string;
 *   isGeneric: true;
 *   ns: {
 *     prefix: string;
 *     localName: string;
 *     uri: string;
 *   };
 * }} AnyDescriptor
 */

/**
 * @typedef {Base & {
 *   $type: string;
 *   $instanceOf: (type: string) => boolean;
 *   $parent: ModdleElement | AnyModdleElement;
 *   readonly $model: Moddle;
 *   readonly $descriptor: AnyDescriptor;
 *   [key: string]: any;
 * }} AnyModdleElement
 */

// Moddle implementation /////////////////////////////////////////////////

/**
 * @class Moddle
 *
 * A model that can be used to create elements of a specific type.
 *
 * @example
 *
 * var Moddle = require('moddle');
 *
 * var pkg = {
 *   name: 'mypackage',
 *   prefix: 'my',
 *   types: [
 *     { name: 'Root' }
 *   ]
 * };
 *
 * var moddle = new Moddle([pkg]);
 *
 * @param {Array<PackageDef>} packages the packages to contain
 * @param {{ strict?: boolean }} [config={}] moddle configuration
 */
export default function Moddle(packages, config = {}) {

  this.properties = new Properties(this);

  this.factory = new Factory(this, this.properties);
  this.registry = new Registry(packages, this.properties);

  /**
   * @type {Record<string,ModdleElementType>}
   */
  this.typeCache = {};

  this.config = config;
}

/**
 * Create an instance of the specified type.
 *
 * @method Moddle#create
 *
 * @example
 *
 * var foo = moddle.create('my:Foo');
 * var bar = moddle.create('my:Bar', { id: 'BAR_1' });
 *
 * @param  {String|Object} descriptor the type descriptor or name know to the model
 * @param  {Object} attrs a number of attributes to initialize the model instance with
 * @return {ModdleElement} model instance
 */
Moddle.prototype.create = function(descriptor, attrs) {
  var Type = this.getType(descriptor);

  if (!Type) {
    throw new Error('unknown type <' + descriptor + '>');
  }

  return new Type(attrs);
};

/**
 * Returns the type representing a given descriptor
 *
 * @method Moddle#getType
 *
 * @example
 *
 * var Foo = moddle.getType('my:Foo');
 * var foo = new Foo({ 'id' : 'FOO_1' });
 *
 * @param  {String|Object} descriptor the type descriptor or name know to the model
 * @return {ModdleElementType} the type representing the descriptor
 */
Moddle.prototype.getType = function(descriptor) {

  var cache = this.typeCache;

  var name = isString(descriptor) ? descriptor : descriptor.ns.name;

  var type = cache[name];

  if (!type) {
    descriptor = this.registry.getEffectiveDescriptor(name);
    type = cache[name] = this.factory.createType(descriptor);
  }

  return type;
};

/**
 * Creates an any-element type to be used within model instances.
 *
 * This can be used to create custom elements that lie outside the meta-model.
 * The created element contains all the meta-data required to serialize it
 * as part of meta-model elements.
 *
 * @method Moddle#createAny
 *
 * @example
 *
 * var foo = moddle.createAny('vendor:Foo', 'http://vendor', {
 *   value: 'bar'
 * });
 *
 * var container = moddle.create('my:Container', 'http://my', {
 *   any: [ foo ]
 * });
 *
 * // go ahead and serialize the stuff
 *
 * @param  {String} name  the name of the element
 * @param  {String} nsUri the namespace uri of the element
 * @param  {Record<string,any>} [properties] a map of properties to initialize the instance with
 * @return {AnyModdleElement} the any type instance
 */
Moddle.prototype.createAny = function(name, nsUri, properties) {

  var nameNs = parseNameNs(name);

  var element = {
    $type: name,
    $instanceOf: function(type) {
      return type === this.$type;
    },
    get: function(key) {
      return this[key];
    },
    set: function(key, value) {
      set(this, [ key ], value);
    }
  };

  var descriptor = {
    name: name,
    isGeneric: true,
    ns: {
      prefix: nameNs.prefix,
      localName: nameNs.localName,
      uri: nsUri
    }
  };

  this.properties.defineDescriptor(element, descriptor);
  this.properties.defineModel(element, this);
  this.properties.define(element, 'get', { enumerable: false, writable: true });
  this.properties.define(element, 'set', { enumerable: false, writable: true });
  this.properties.define(element, '$parent', { enumerable: false, writable: true });
  this.properties.define(element, '$instanceOf', { enumerable: false, writable: true });

  forEach(properties, function(a, key) {
    if (isObject(a) && a.value !== undefined) {
      element[a.name] = a.value;
    } else {
      element[key] = a;
    }
  });

  return element;
};

/**
 * Returns a registered package by uri or prefix
 * @param {string} uriOrPrefix
 * @return {RegisteredPackage} the package
 */
Moddle.prototype.getPackage = function(uriOrPrefix) {
  return this.registry.getPackage(uriOrPrefix);
};

/**
 * Returns a snapshot of all known packages
 *
 * @return {Array<RegisteredPackage>} the package
 */
Moddle.prototype.getPackages = function() {
  return this.registry.getPackages();
};

/**
 * Returns the descriptor for an element
 * @param {ModdleElement | ModdleElementType} element
 * @return {EffectiveDescriptor}
 */
Moddle.prototype.getElementDescriptor = function(element) {
  return element.$descriptor;
};

/**
 * Returns true if the given descriptor or instance
 * represents the given type.
 *
 * May be applied to this, if element is omitted.
 * @param {ModdleElement | ModdleElementType | string} element
 * @param {string} [type]
 * @return {boolean}
 */
Moddle.prototype.hasType = function(element, type) {
  if (type === undefined) {
    type = element;
    element = this;
  }

  var descriptor = element.$model.getElementDescriptor(element);

  return (type in descriptor.allTypesByName);
};

/**
 * Returns the descriptor of an elements named property
 * @param {ModdleElement} element
 * @param {string} property
 * @return {PropertyDesc}
 */
Moddle.prototype.getPropertyDescriptor = function(element, property) {
  return this.getElementDescriptor(element).propertiesByName[property];
};

/**
 * Returns a mapped type's descriptor
 * @param {string} type
 * @return {RegisteredTypeDef}
 */
Moddle.prototype.getTypeDescriptor = function(type) {
  return this.registry.typeMap[type];
};