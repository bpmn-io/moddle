import expect from '../expect.js';

import {
  coerceType,
  isBuiltIn,
  isSimple
} from '../../lib/types.js';


var OBJECT_PROPERTIES = [ 'constructor', 'toString', '__proto__', 'hasOwnProperty' ];


describe('Types', function() {

  describe('coerceType', function() {

    it('should convert Real', function() {
      expect(coerceType('Real', '420')).to.eql(420.0);
    });


    it('should convert Real (-0.01)', function() {
      expect(coerceType('Real', '-0.01')).to.eql(-0.01);
    });


    it('should convert Boolean (true)', function() {
      expect(coerceType('Boolean', 'true')).to.equal(true);
    });


    it('should convert Boolean (false)', function() {
      expect(coerceType('Boolean', 'false')).to.equal(false);
    });


    it('should convert Integer', function() {
      expect(coerceType('Integer', '12012')).to.equal(12012);
    });


    it('should NOT convert complex', function() {
      var complexElement = { a: 'A' };
      expect(coerceType('Element', complexElement)).to.equal(complexElement);
    });


    it('should NOT convert Object properties', function() {

      for (const property of OBJECT_PROPERTIES) {

        // given
        var value = { a: 'A' };

        // when
        // then
        expect(coerceType(property, value), property).to.equal(value);
      }
    });

  });


  describe('isBuiltIn', function() {

    it('should recognize built-in types', function() {
      expect(isBuiltIn('String')).to.be.true;
      expect(isBuiltIn('Boolean')).to.be.true;
      expect(isBuiltIn('Integer')).to.be.true;
      expect(isBuiltIn('Real')).to.be.true;
      expect(isBuiltIn('Element')).to.be.true;
    });


    it('should NOT recognize custom types', function() {
      expect(isBuiltIn('props:Complex')).to.be.false;
    });


    it('should NOT recognize Object properties as built-in', function() {

      for (const property of OBJECT_PROPERTIES) {
        expect(isBuiltIn(property), property).to.be.false;
      }
    });

  });


  describe('isSimple', function() {

    it('should recognize simple types', function() {
      expect(isSimple('String')).to.be.true;
      expect(isSimple('Boolean')).to.be.true;
      expect(isSimple('Integer')).to.be.true;
      expect(isSimple('Real')).to.be.true;
    });


    it('should NOT recognize Element as simple', function() {
      expect(isSimple('Element')).to.be.false;
    });


    it('should NOT recognize Object properties as simple', function() {

      for (const property of OBJECT_PROPERTIES) {
        expect(isSimple(property), property).to.be.false;
      }
    });

  });

});


