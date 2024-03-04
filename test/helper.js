import fs from 'fs';

import {
  map
} from 'min-dash';

import { Moddle } from 'moddle';

import expect from './expect.js';


export function readFile(filename) {
  return fs.readFileSync(filename, { encoding: 'UTF-8' });
}

export function createModelBuilder(base) {

  var cache = {};

  if (!base) {
    throw new Error('[test-util] must specify a base directory');
  }

  function createModel(packageNames, config = {}) {

    var packages = map(packageNames, function(f) {
      var pkg = cache[f];
      var file = base + f + '.json';

      if (!pkg) {
        try {
          pkg = cache[f] = JSON.parse(readFile(base + f + '.json'));
        } catch (e) {
          throw new Error('[Helper] failed to parse <' + file + '> as JSON: ' + e.message);
        }
      }

      return pkg;
    });

    return new Moddle(packages, config);
  }

  return createModel;
}

/**
 * @param {Object} descriptor
 * @param {string[]} expectedPropertyNames
 */
export function expectOrderedProperties(descriptor, expectedPropertyNames) {
  var propertyNames = descriptor.properties.map(function(p) {
    return p.name;
  });

  // then
  expect(propertyNames).to.eql(expectedPropertyNames);
}

/**
 * @param {Moddle} model
 * @param {string} typeName
 *
 * @return {Object} descriptor
 */
export function getEffectiveDescriptor(model, typeName) {
  var Type = model.getType(typeName);

  return model.getElementDescriptor(Type);
}