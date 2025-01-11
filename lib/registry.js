import {
  assign,
  forEach,
  bind
} from 'min-dash';

import {
  isBuiltIn as isBuiltInType
} from './types.js';

import DescriptorBuilder from './descriptor-builder.js';

import {
  parseName as parseNameNs
} from './ns.js';

/**
 * @typedef {import('./ns.js').Namespace} Namespace
 * @typedef {import('./moddle.js').PackageDefinition} PackageDefinition
 * @typedef {import('./moddle.js').TypeDefinition} TypeDefinition
 * @typedef {import('./moddle.js').PropertyDefinition} PropertyDefinition
 * @typedef {import('./properties.js').default} Properties
 * @typedef {import('./descriptor-builder.js').EffectiveDescriptor} EffectiveDescriptor
 */

/**
 * Registered package definition
 * @typedef {Omit<PackageDefinition, 'types'> & {
 *   types: Array<RegisteredTypeDef>;
 * }} RegisteredPackage
 */

/**
 * Registered type definition
 * @typedef {Omit<TypeDefinition, 'properties'> & {
 *   properties: Array<RegisteredPropertyDef>;
 *   propertiesByName: Record<string, RegisteredPropertyDef>;
 *   superClass: Array<string>;
 *   extends: Array<string>;
 *   meta: Record<string, *>;
 *   traits: Array<string>;
 *   ns: Namespace;
 *   readonly $pkg: RegisteredPackage;
 * }} RegisteredTypeDef
 */

/**
 * Registered property definition
 * @typedef {PropertyDefinition & { ns: Namespace }} RegisteredPropertyDef
 */

/**
 * A registry of Moddle packages.
 *
 * @param {Array<PackageDefinition> | Record<string,PackageDefinition>} packages
 * @param {Properties} properties
 */
export default function Registry(packages, properties) {

  /**
   *  @type {Record<string, RegisteredPackage>} registered packages map
   */
  this.packageMap = {};

  /**
   * @type {Record<string,RegisteredTypeDef>}
   */
  this.typeMap = {};

  /**
   * @type {Array<RegisteredPackage>} all registered packages
   */
  this.packages = [];

  /**
   * @type {Properties}
   */
  this.properties = properties;

  forEach(packages, bind(this.registerPackage, this));
}

/**
 * @param {string} uriOrPrefix uri or prefix of package
 * @return {RegisteredPackage} registered package
 */
Registry.prototype.getPackage = function(uriOrPrefix) {
  return this.packageMap[uriOrPrefix];
};

/**
 * @return {Array<RegisteredPackage>} all registered packages
 */
Registry.prototype.getPackages = function() {
  return this.packages;
};

/**
 * @param {PackageDefinition} pkg registering package
 */
Registry.prototype.registerPackage = function(pkg) {

  // copy package
  pkg = assign({}, pkg);

  var pkgMap = this.packageMap;

  ensureAvailable(pkgMap, pkg, 'prefix');
  ensureAvailable(pkgMap, pkg, 'uri');

  // register types
  forEach(pkg.types, bind(function(descriptor) {
    this.registerType(descriptor, pkg);
  }, this));

  pkgMap[pkg.uri] = pkgMap[pkg.prefix] = pkg;
  this.packages.push(pkg);
};

/**
 * Register a type from a specific package with us
 * @param {TypeDefinition} type
 * @param {RegisteredPackage} pkg
 */
Registry.prototype.registerType = function(type, pkg) {
  type = assign({}, type, {
    superClass: (type.superClass || []).slice(),
    extends: (type.extends || []).slice(),
    properties: (type.properties || []).slice(),
    meta: assign(({}, type.meta || {}))
  });

  var ns = parseNameNs(type.name, pkg.prefix),
      name = ns.name,
      /** @type {Record<string, RegisteredPropertyDef>} */ propertiesByName = {};

  // parse properties
  forEach(type.properties, bind(function(p) {

    // namespace property names
    var propertyNs = parseNameNs(p.name, ns.prefix),
        propertyName = propertyNs.name;

    // namespace property types
    if (!isBuiltInType(p.type)) {
      p.type = parseNameNs(p.type, propertyNs.prefix).name;
    }

    assign(p, {
      ns: propertyNs,
      name: propertyName
    });

    propertiesByName[propertyName] = p;
  }, this));

  // update ns + name
  assign(type, {
    ns: ns,
    name: name,
    propertiesByName: propertiesByName
  });

  forEach(type.extends, bind(function(extendsName) {
    var extendsNameNs = parseNameNs(extendsName, ns.prefix);

    var extended = this.typeMap[extendsNameNs.name];

    extended.traits = extended.traits || [];
    extended.traits.push(name);
  }, this));

  // link to package
  this.definePackage(type, pkg);

  // register
  this.typeMap[name] = type;
};

/**
 * @callback IteratorFn
 * @param {RegisteredTypeDef} type
 * @param {boolean} inherited
 */

/**
 * Traverse the type hierarchy from bottom to top,
 * calling iterator with (type, inherited) for all elements in
 * the inheritance chain.
 *
 * @param {Namespace} nsName
 * @param {IteratorFn} iterator
 * @param {Boolean} [trait=false]
 */
Registry.prototype.mapTypes = function(nsName, iterator, trait) {

  /** @type {RegisteredTypeDef} */
  var type = isBuiltInType(nsName.name) ? { name: nsName.name } : this.typeMap[nsName.name];

  var self = this;

  /**
   * Traverse the selected super type or trait
   *
   * @param {String} cls
   * @param {Boolean} [trait=false]
   */
  function traverse(cls, trait) {
    var parentNs = parseNameNs(cls, isBuiltInType(cls) ? '' : nsName.prefix);
    self.mapTypes(parentNs, iterator, trait);
  }

  /**
   * Traverse the selected trait.
   *
   * @param {String} cls
   */
  function traverseTrait(cls) {
    return traverse(cls, true);
  }

  /**
   * Traverse the selected super type
   *
   * @param {String} cls
   */
  function traverseSuper(cls) {
    return traverse(cls, false);
  }

  if (!type) {
    throw new Error('unknown type <' + nsName.name + '>');
  }

  forEach(type.superClass, trait ? traverseTrait : traverseSuper);

  // call iterator with (type, inherited=!trait)
  iterator(type, !trait);

  forEach(type.traits, traverseTrait);
};

/**
 * Returns the effective descriptor for a type.
 * @param  {Namespace['name']} name the namespaced name (ns:localName) of the type
 * @return {EffectiveDescriptor} the resulting effective descriptor
 */
Registry.prototype.getEffectiveDescriptor = function(name) {

  var nsName = parseNameNs(name);

  var builder = new DescriptorBuilder(nsName);

  this.mapTypes(nsName, function(type, inherited) {
    builder.addTrait(type, inherited);
  });

  var descriptor = builder.build();

  // define package link
  this.definePackage(descriptor, descriptor.allTypes[descriptor.allTypes.length - 1].$pkg);

  return descriptor;
};

/**
 * @param {RegisteredTypeDef | EffectiveDescriptor} target
 * @param {RegisteredPackage} pkg
 */
Registry.prototype.definePackage = function(target, pkg) {
  this.properties.define(target, '$pkg', { value: pkg });
};

// helpers ////////////////////////////

/**
 * Checking already defined packages
 * @param {Record<string, RegisteredPackage>} packageMap
 * @param {PackageDefinition} pkg
 * @param {'prefix' | 'uri'} identifierKey
 */
function ensureAvailable(packageMap, pkg, identifierKey) {

  var value = pkg[identifierKey];

  if (value in packageMap) {
    throw new Error('package with ' + identifierKey + ' <' + value + '> already defined');
  }
}
