'use strict';

var _ = require('lodash');

var Types = require('./types'),
    DescriptorBuilder = require('./descriptor-builder');

var parseNameNs = require('./ns').parseName;


function Registry(packages, properties, options) {
  this.options = _.extend({ generateId: 'id' }, options || {});

  this.packageMap = {};
  this.typeMap = {};

  this.packages = [];

  this.properties = properties;

  _.forEach(packages, this.registerPackage, this);
}

module.exports = Registry;


Registry.prototype.getPackage = function(uriOrPrefix) {
  return this.packageMap[uriOrPrefix];
};

Registry.prototype.getPackages = function() {
  return this.packages;
};


Registry.prototype.registerPackage = function(pkg) {

  // register types
  _.forEach(pkg.types, function(descriptor) {
    this.registerType(descriptor, pkg);
  }, this);

  this.packageMap[pkg.uri] = this.packageMap[pkg.prefix] = pkg;
  this.packages.push(pkg);
};


/**
 * Register a type from a specific package with us
 */
Registry.prototype.registerType = function(type, pkg) {

  var ns = parseNameNs(type.name, pkg.prefix),
      name = ns.name,
      propertiesByName = {};

  // parse properties
  _.forEach(type.properties, function(p) {

    // namespace property names
    var propertyNs = parseNameNs(p.name, ns.prefix),
        propertyName = propertyNs.name;

    // namespace property types
    if (!Types.isBuiltIn(p.type)) {
      p.type = parseNameNs(p.type, propertyNs.prefix).name;
    }

    _.extend(p, {
      ns: propertyNs,
      name: propertyName
    });

    propertiesByName[propertyName] = p;
  });

  // update ns + name
  _.extend(type, {
    ns: ns,
    name: name,
    propertiesByName: propertiesByName
  });

  // link to package
  this.definePackage(type, pkg);

  // register
  this.typeMap[name] = type;
};


/**
 * Traverse the type hierarchy from bottom to top.
 */
Registry.prototype.mapTypes = function(nsName, iterator) {

  var type = this.typeMap[nsName.name];

  if (!type) {
    throw new Error('unknown type <' + nsName.name + '>');
  }

  _.forEach(type.superClass, function(cls) {
    var parentNs = parseNameNs(cls, nsName.prefix);
    this.mapTypes(parentNs, iterator);
  }, this);

  iterator(type);
};


/**
 * Returns the effective descriptor for a type.
 *
 * @param  {String} type the namespaced name (ns:localName) of the type
 *
 * @return {Descriptor} the resulting effective descriptor
 */
Registry.prototype.getEffectiveDescriptor = function(name) {

  var options = this.options,
      nsName = parseNameNs(name);

  var builder = new DescriptorBuilder(nsName);

  this.mapTypes(nsName, function(type) {
    builder.addTrait(type);
  });

  // check we have an id assigned
  var id = this.options.generateId;
  if (id && !builder.hasProperty(id)) {
    builder.addIdProperty(id);
  }

  var descriptor = builder.build();

  // define package link
  this.definePackage(descriptor, descriptor.allTypes[descriptor.allTypes.length - 1].$pkg);

  return descriptor;
};


Registry.prototype.definePackage = function(target, pkg) {
  this.properties.define(target, '$pkg', { value: pkg });
};