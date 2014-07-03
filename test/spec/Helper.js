'use strict';

var debug = require('debug')('moddle-test');

var fs = require('fs'),
    _ = require('lodash'),
    inspect = require('util').inspect;

var Moddle = require('../../');

var jsondiffpatch = require('jsondiffpatch').create({
  objectHash: function (obj) {
    return JSON.stringify(obj);
  }
});


function readFile(filename) {
  return fs.readFileSync(filename, { encoding: 'UTF-8' });
}

function addMatchers() {

  // this == jasmine

  this.addMatchers({

    toDeepEqual: function(expected) {

      // jasmine 1.3.x
      var actual = this.actual;
      var actualClone = _.cloneDeep(actual);
      var expectedClone = _.cloneDeep(expected);

      var result = {
        pass: _.isEqual(actualClone, expectedClone)
      };

      if (!result.pass) {
        debug('[to-deep-equal] elements do not equal. diff: ' + inspect(jsondiffpatch.diff(actualClone, expectedClone), false, 4));
      }

      // jasmine 1.3.x
      return result.pass;
    }
  });
}

function createModelBuilder(base) {

  var cache = {};

  if (!base) {
    throw new Error('[test-util] must specify a base directory');
  }

  function createModel(packageNames) {

    var packages = _.collect(packageNames, function(f) {
      var pkg = cache[f];
      var file = base + f + '.json';

      if (!pkg) {
        try {
          pkg = cache[f] = JSON.parse(readFile(base + f + '.json'));
        } catch (e) {
          throw new Error('[Helper] failed to parse <' + file + '> as JSON: ' +  e.message);
        }
      }

      return pkg;
    });

    return new Moddle(packages);
  }

  return createModel;
}


module.exports.readFile = readFile;
module.exports.addMatchers = addMatchers;
module.exports.createModelBuilder = createModelBuilder;