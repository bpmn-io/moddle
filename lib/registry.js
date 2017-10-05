'use strict';

var assign = require('lodash/object/assign'),
    keys = require('lodash/object/keys'),
    forEach = require('lodash/collection/forEach');

var Types = require('./types'),
    DescriptorBuilder = require('./descriptor-builder');

var parseNameNs = require('./ns').parseName,
    isBuiltInType = Types.isBuiltIn;


function Registry(packages, properties) {
  this.packageMap = {};
  this.typeMap = {};
  this.enumerationMap = {};

  this.packages = [];

  this.properties = properties;
  this.unresolvedProperties = {};

  forEach(packages, this.registerPackage, this);

  var unresolvedKeys = keys(this.unresolvedProperties);
  if (unresolvedKeys.length > 0) {
    throw new Error('At least one property type could not be resolved (<' + keys[0] + '>)');
  }
}

module.exports = Registry;


Registry.prototype.getPackage = function(uriOrPrefix) {
  return this.packageMap[uriOrPrefix];
};

Registry.prototype.getPackages = function() {
  return this.packages;
};


Registry.prototype.registerPackage = function(pkg) {

  // copy package
  pkg = assign({}, pkg);

  // register types
  forEach(pkg.types, function(descriptor) {
    this.registerType(descriptor, pkg);
  }, this);

  forEach(pkg.enumerations, function(descriptor) {
    this.registerEnumeration(descriptor, pkg);
  }, this);

  this.packageMap[pkg.uri] = this.packageMap[pkg.prefix] = pkg;
  this.packages.push(pkg);
};


/**
 * Register a type from a specific package with us
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
      propertiesByName = {};

  delete this.unresolvedProperties[ns.name];

  // parse properties
  forEach(type.properties, function(p) {

    // namespace property names
    var propertyNs = parseNameNs(p.name, ns.prefix),
        propertyName = propertyNs.name;

    // namespace property types
    if (!isBuiltInType(p.type)) {
      p.type = parseNameNs(p.type, propertyNs.prefix).name;

      var type = this.typeMap[p.type];
      var enumeration = this.enumerationMap[p.type];
      if (!type && !enumeration && name !== p.type) {
        this.unresolvedProperties[p.type] = p;
      }
    }

    assign(p, {
      ns: propertyNs,
      name: propertyName
    });

    propertiesByName[propertyName] = p;
  }, this);

  // update ns + name
  assign(type, {
    ns: ns,
    name: name,
    propertiesByName: propertiesByName
  });

  forEach(type.extends, function(extendsName) {
    var extended = this.typeMap[extendsName];

    extended.traits = extended.traits || [];
    extended.traits.push(name);
  }, this);

  // link to package
  this.definePackage(type, pkg);

  // register
  this.typeMap[name] = type;
};


Registry.prototype.registerEnumeration = function(enumeration, pkg) {

  enumeration = assign({}, enumeration, {
    literalValues: (enumeration.literalValues || []).slice()
  });

  var ns = parseNameNs(enumeration.name, pkg.prefix),
      name = ns.name;

  delete this.unresolvedProperties[name];

  var literalValuesByName = {};
  forEach(enumeration.literalValues, function(value) {
    literalValuesByName[value.name] = value;
  });

  assign(enumeration, {
    ns: ns,
    name: name,
    literalValuesByName: literalValuesByName
  });

  this.definePackage(enumeration, pkg);

  this.enumerationMap[name] = enumeration;
};


/**
 * Traverse the type hierarchy from bottom to top,
 * calling iterator with (type, inherited) for all elements in
 * the inheritance chain.
 *
 * @param {Object} nsName
 * @param {Function} iterator
 * @param {Boolean} [trait=false]
 */
Registry.prototype.mapTypes = function(nsName, iterator, trait) {

  var type = isBuiltInType(nsName.name) ? { name: nsName.name } : this.typeMap[nsName.name];

  var self = this;

  /**
   * Traverse the selected trait.
   *
   * @param {String} cls
   */
  function traverseTrait(cls) {
    return traverseSuper(cls, true);
  }

  /**
   * Traverse the selected super type or trait
   *
   * @param {String} cls
   * @param {Boolean} [trait=false]
   */
  function traverseSuper(cls, trait) {
    var parentNs = parseNameNs(cls, isBuiltInType(cls) ? '' : nsName.prefix);
    self.mapTypes(parentNs, iterator, trait);
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
 *
 * @param  {String} type the namespaced name (ns:localName) of the type
 *
 * @return {Descriptor} the resulting effective descriptor
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


Registry.prototype.definePackage = function(target, pkg) {
  this.properties.define(target, '$pkg', { value: pkg });
};
