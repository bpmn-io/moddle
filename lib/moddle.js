'use strict';

var isString = require('lodash/lang/isString'),
    isObject = require('lodash/lang/isObject'),
    forEach = require('lodash/collection/forEach'),
    find = require('lodash/collection/find');


var Factory = require('./factory'),
    Registry = require('./registry'),
    Properties = require('./properties');

var parseNameNs = require('./ns').parseName;


//// Moddle implementation /////////////////////////////////////////////////

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
 * @param {Array<Package>} packages the packages to contain
 */
function Moddle(packages) {

  this.properties = new Properties(this);

  this.factory = new Factory(this, this.properties);
  this.registry = new Registry(packages, this.properties);

  this.typeCache = {};
}

module.exports = Moddle;


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
 * @param  {Object} attrs   a number of attributes to initialize the model instance with
 * @return {Object}         model instance
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
 * @return {Object}         the type representing the descriptor
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
 *
 * @param  {String} name  the name of the element
 * @param  {String} nsUri the namespace uri of the element
 * @param  {Object} [properties] a map of properties to initialize the instance with
 * @return {Object} the any type instance
 */
Moddle.prototype.createAny = function(name, nsUri, properties) {

  var nameNs = parseNameNs(name);

  var element = {
    $type: name
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
  this.properties.define(element, '$parent', { enumerable: false, writable: true });

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
 *
 * @return {Object} the package
 */
Moddle.prototype.getPackage = function(uriOrPrefix) {
  return this.registry.getPackage(uriOrPrefix);
};

/**
 * Returns a snapshot of all known packages
 *
 * @return {Object} the package
 */
Moddle.prototype.getPackages = function() {
  return this.registry.getPackages();
};

/**
 * Returns the descriptor for an element
 */
Moddle.prototype.getElementDescriptor = function(element) {
  return element.$descriptor;
};

/**
 * Returns true if the given descriptor or instance
 * represents the given type.
 *
 * May be applied to this, if element is omitted.
 */
Moddle.prototype.hasType = function(element, type) {
  if (type === undefined) {
    type = element;
    element = this;
  }

  var descriptor = element.$model.getElementDescriptor(element);

  return !!find(descriptor.allTypes, function(t) {
    return t.name === type;
  });
};


/**
 * Returns the descriptor of an elements named property
 */
Moddle.prototype.getPropertyDescriptor = function(element, property) {
  return this.getElementDescriptor(element).propertiesByName[property];
};
