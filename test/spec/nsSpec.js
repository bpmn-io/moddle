'use strict';

var Helper = require('./Helper');

var ns = require('../../lib/ns');


describe('ns', function() {

  beforeEach(Helper.addMatchers);


  describe('parseName', function() {

    it('should parse namespaced name', function() {
      expect(ns.parseName('asdf:bar')).toDeepEqual({ name: 'asdf:bar', localName: 'bar', prefix: 'asdf' });
    });


    it('should parse localName (with default ns)', function() {
      expect(ns.parseName('bar', 'asdf')).toDeepEqual({ name: 'asdf:bar', localName: 'bar', prefix: 'asdf' });
    });


    it('should parse non-ns name', function() {
      expect(ns.parseName('bar')).toDeepEqual({ name: 'bar', localName: 'bar', prefix: undefined });
    });


    it('should handle invalid input', function() {
      expect(function() {
        ns.parseName('asdf:foo:bar');
      }).toThrow();
    });

  });
});