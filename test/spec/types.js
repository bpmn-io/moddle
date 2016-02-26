'use strict';

var Types = require('../../lib/types');


describe('Types', function() {

  describe('coerceType', function() {

    it('should convert Real', function() {
      expect(Types.coerceType('Real', '420')).to.eql(420.0);
    });


    it('should convert Real (-0.01)', function() {
      expect(Types.coerceType('Real', '-0.01')).to.eql(-0.01);
    });


    it('should convert Boolean (true)', function() {
      expect(Types.coerceType('Boolean', 'true')).to.equal(true);
    });


    it('should convert Boolean (false)', function() {
      expect(Types.coerceType('Boolean', 'false')).to.equal(false);
    });


    it('should convert Integer', function() {
      expect(Types.coerceType('Integer', '12012')).to.equal(12012);
    });


    it('should NOT convert complex', function() {
      var complexElement = { a: 'A' };
      expect(Types.coerceType('Element', complexElement)).to.equal(complexElement);
    });

  });

});


