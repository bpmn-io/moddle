'use strict';

var Helper = require('./Helper');

var Types = require('../../lib/types');


describe('Types', function() {

  beforeEach(Helper.addMatchers);


  describe('coerceType', function() {

    it('should convert Real', function() {
      expect(Types.coerceType('Real', '420')).toEqual(420.0);
    });


    it('should convert Real (-0.01)', function() {
      expect(Types.coerceType('Real', '-0.01')).toEqual(-0.01);
    });


    it('should convert Boolean (true)', function() {
      expect(Types.coerceType('Boolean', 'true')).toBe(true);
    });


    it('should convert Boolean (false)', function() {
      expect(Types.coerceType('Boolean', 'false')).toBe(false);
    });


    it('should convert Integer', function() {
      expect(Types.coerceType('Integer', '12012')).toBe(12012);
    });


    it('should NOT convert complex', function() {
      var complexElement = { a: 'A' };
      expect(Types.coerceType('Element', complexElement)).toBe(complexElement);
    });

  });

});


