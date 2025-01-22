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
 * @typedef {import('./registry.js').RegisteredTypeDef} RegisteredTypeDef
 * @typedef {import('./registry.js').RegisteredPackage} RegisteredPackage
 * @typedef {import('./base.js').default} BaseElement
 * @typedef {import('./descriptor-builder.js').EffectiveDescriptor} EffectiveDescriptor
 * @typedef {import('./descriptor-builder.js').AnyTypeDescriptor} AnyTypeDescriptor
 * @typedef {import('./descriptor-builder.js').PropertyDescriptor} PropertyDescriptor
 */

/**
 * @template [T=Record<string,any>]
 * @typedef {import('./factory.js').ModdleElement<T>} ModdleElement
 * @typedef {import('./factory.js').ModdleElementType<T>} ModdleElementType
 * @typedef {import('./factory.js').AnyModdleElement<T>} AnyModdleElement
 */

/**
 * Package definition
 * @typedef {{
 *   $schema?: string;
 *   name: string;
 *   prefix: string;
 *   types?: Array<TypeDefinition>;
 *   [key: string]: any;
 * } & PackageDefinitionXmlExtension} PackageDefinition
 */

/**
 * Set of extended parameters for package definition used in moddle-xml.
 * @typedef {{
 *   uri?: string;
 *   xml?: {
 *     tagAlias?: 'lowerCase';
 *     typePrefix?: string;
 *   };
 * }} PackageDefinitionXmlExtension
 */

/**
 * Type definition in declaration in package
 * @typedef {{
 *   name: string;
 *   isAbstract?: boolean;
 *   properties?: Array<PropertyDefinition>;
 *   superClass?: Array<string>;
 *   extends?: Array<string>;
 *   meta?: Record<string, *>;
 *   [key: string]: any;
 * }} TypeDefinition
 */

/**
 * Set of extended parameters for property definition used in moddle-xml.
 * @typedef {{
 *   isBody?: boolean;
 *   isAttr?: boolean;
 *   xml?: {
 *     serialize?: string;
 *   };
 * }} PropertyDefinitionXmlExtension
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
 * } & PropertyDefinitionXmlExtension} PropertyDefinition
 */

// Moddle implementation /////////////////////////////////////////////////

/**
 * @class Moddle
 *
 * A model that can be used to create elements of a specific type.
 *
 * @example
 *
 * import Moddle from 'moddle';
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
 * @param {Array<PackageDefinition> | Record<string,PackageDefinition>} packages the packages to contain
 * @param {{ strict?: boolean }} [config={}] moddle configuration
 */
export default function Moddle(packages, config = {}) {

  /** @type Readonly<Properties> */
  this.properties = new Properties(this);

  /** @type Readonly<Factory> */
  this.factory = new Factory(this, this.properties);

  /** @type Readonly<Registry> */
  this.registry = new Registry(packages, this.properties);

  /**
   * @type {Record<string,ModdleElementType>}
   */
  this.typeCache = {};

  /**
   * @type {Readonly<{readonly strict?: boolean}>}
   */
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
 * @template [T=Record<string,any>]
 * @param  {String|EffectiveDescriptor} descriptor the type descriptor or name know to the model
 * @param  {Partial<T>} [attrs] a number of attributes to initialize the model instance with
 * @return {ModdleElement<T>} model instance
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
 * @template [T=Record<string,any>]
 * @param  {String|EffectiveDescriptor} descriptor the type descriptor or name know to the model
 * @return {ModdleElementType<T>} the type representing the descriptor
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
 * @template [T=Record<string, any>]
 * @param  {String} name  the name of the element
 * @param  {String} nsUri the namespace uri of the element
 * @param  {T} [properties] a map of properties to initialize the instance with
 * @return {AnyModdleElement<T>} the any type instance
 */
Moddle.prototype.createAny = function(name, nsUri, properties) {

  var nameNs = parseNameNs(name);

  /** @type AnyModdleElement */
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

  /** @type AnyTypeDescriptor */
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
 * @return {Readonly<Array<RegisteredPackage>>} the package
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
 * @overload
 * Returns true if the given descriptor or instance
 * represents the given type.
 * @param {ModdleElement | ModdleElementType} element
 * @param {string} type
 * @return {boolean}
 */
/**
 * @overload
 * @param {string} type
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
 * @param {ModdleElement | ModdleElementType} element
 * @param {string} property
 * @return {PropertyDescriptor}
 */
Moddle.prototype.getPropertyDescriptor = function(element, property) {
  return this.getElementDescriptor(element).propertiesByName[property];
};

/**
 * Return registered type definition
 * @param {string} type
 * @return {RegisteredTypeDef}
 */
Moddle.prototype.getTypeDescriptor = function(type) {
  return this.registry.typeMap[type];
};