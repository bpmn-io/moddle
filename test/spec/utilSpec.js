'use strict';

var Helper = require('./Helper');

var util = require('../../lib/util'),
    parseNameNs = util.parseNameNs,
    coerceType = util.coerceType;


describe('util', function() {

  beforeEach(Helper.addMatchers);


  describe('parseNameNs', function() {

    it('should parse namespaced name', function() {
      expect(parseNameNs('asdf:bar')).toDeepEqual({ name: 'asdf:bar', localName: 'bar', prefix: 'asdf' });
    });


    it('should parse localName (with default ns)', function() {
      expect(parseNameNs('bar', 'asdf')).toDeepEqual({ name: 'asdf:bar', localName: 'bar', prefix: 'asdf' });
    });


    it('should parse non-ns name', function() {
      expect(parseNameNs('bar')).toDeepEqual({ name: 'bar', localName: 'bar', prefix: undefined });
    });


    it('should handle invalid input', function() {
      expect(function() {
        parseNameNs('asdf:foo:bar');
      }).toThrow();
    });

  });


  describe('coerceType', function() {

    it('should convert Real', function() {
      expect(coerceType('Real', '420')).toEqual(420.0);
    });


    it('should convert Real (-0.01)', function() {
      expect(coerceType('Real', '-0.01')).toEqual(-0.01);
    });


    it('should convert Boolean (true)', function() {
      expect(coerceType('Boolean', 'true')).toBe(true);
    });


    it('should convert Boolean (false)', function() {
      expect(coerceType('Boolean', 'false')).toBe(false);
    });


    it('should convert Integer', function() {
      expect(coerceType('Integer', '12012')).toBe(12012);
    });


    it('should NOT convert complex', function() {
      var complexElement = { a: 'A' };
      expect(coerceType('Element', complexElement)).toBe(complexElement);
    });

  });
});