'use strict';

var Helper = require('../helper');


describe('moddle', function() {

  var createModel = Helper.createModelBuilder('test/fixtures/model/extension/');
  var model = createModel([ 'base', 'custom' ]);


  describe('extension', function() {

    describe('trait', function() {

      it('should plug-in into type hierarchy', function() {

        var root = model.create('b:Root');

        // then
        expect(root.$instanceOf('c:CustomRoot')).to.be.true;
      });


      it('should add custom attribute', function() {

        // when
        var root = model.create('b:Root', {
          customAttr: -1
        });

        // then
        expect(root.customAttr).to.eql(-1);
      });


      it('should refine property', function() {
        // given
        var Type = model.getType('b:Root');

        // when
        var genericProperty = Type.$descriptor.propertiesByName['generic'];

        // then
        expect(genericProperty.type).to.eql('c:CustomGeneric');
      });


      it('should use refined property', function() {

        var customGeneric = model.create('c:CustomGeneric', { count: 100 });

        // when
        var root = model.create('b:Root', {
          generic: customGeneric
        });

        // then
        expect(root.generic).to.eql(customGeneric);
      });

    });


    describe('types', function() {

      it('should provide custom types', function() {

        var property = model.create('c:Property');

        // then
        expect(property.$instanceOf('c:Property')).to.be.true;
      });

    });


    describe('generic', function() {

      it('should extend Element', function() {

        // when
        var customGeneric = model.create('c:CustomGeneric', { count: 100 });

        // then
        expect(customGeneric.$instanceOf('Element')).to.be.true;
      });


      it('should be part of generic collection', function() {

        var customProperty = model.create('c:Property', { key: "foo", value: "bar" });

        // when
        var root = model.create('b:Root', {
          genericCollection: [ customProperty ]
        });

        // then
        expect(root.genericCollection).to.eql([ customProperty ]);
      });

    });

  });

});