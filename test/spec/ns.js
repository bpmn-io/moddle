import expect from '../expect';

import {
  parseName
} from '../../lib/ns';


describe('ns', function() {

  describe('parseName', function() {

    it('should parse namespaced name', function() {
      expect(parseName('asdf:bar')).to.jsonEqual({
        name: 'asdf:bar',
        prefix: 'asdf',
        localName: 'bar'
      });
    });


    it('should parse localName (with default ns)', function() {
      expect(parseName('bar', 'asdf')).to.jsonEqual({
        name: 'asdf:bar',
        prefix: 'asdf',
        localName: 'bar'
      });
    });


    it('should parse non-ns name', function() {
      expect(parseName('bar')).to.jsonEqual({
        name: 'bar',
        prefix: undefined,
        localName: 'bar'
      });
    });


    it('should handle invalid input', function() {
      expect(function() {
        parseName('asdf:foo:bar');
      }).to.throw();
    });

  });

});