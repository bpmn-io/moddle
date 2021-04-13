import expect from '../expect';

import {
  createModelBuilder
} from '../helper';


describe('moddle', function() {

  var createModel = createModelBuilder('test/fixtures/model/');

  describe('base', function() {

    var model = createModel([ 'properties' ]);


    it('should provide types', function() {

      // when
      var ComplexType = model.getType('props:Complex');
      var SimpleBody = model.getType('props:SimpleBody');
      var Attributes = model.getType('props:Attributes');

      // then
      expect(ComplexType).to.exist;
      expect(SimpleBody).to.exist;
      expect(Attributes).to.exist;
    });


    it('should provide packages by prefix', function() {

      // when
      var propertiesPackage = model.getPackage('props');

      // then
      expect(propertiesPackage).to.exist;
      expect(propertiesPackage.name).to.equal('Properties');
      expect(propertiesPackage.uri).to.equal('http://properties');
      expect(propertiesPackage.prefix).to.equal('props');
    });


    it('should provide packages by uri', function() {

      // when
      var propertiesPackage = model.getPackage('http://properties');

      // then
      expect(propertiesPackage).to.exist;
      expect(propertiesPackage.name).to.equal('Properties');
      expect(propertiesPackage.uri).to.equal('http://properties');
      expect(propertiesPackage.prefix).to.equal('props');
    });


    it('should provide type descriptor', function() {

      // given
      var expectedDescriptorNs = { name: 'props:Complex', prefix: 'props', localName: 'Complex' };

      var expectedDescriptorProperties = [
        {
          name: 'id',
          type: 'String',
          isAttr: true,
          isId: true,
          ns: { name: 'props:id', prefix: 'props', localName: 'id' },
          inherited: true
        }
      ];

      var expectedDescriptorPropertiesByName = {

        'id': {
          name: 'id',
          type: 'String',
          isAttr: true,
          isId: true,
          ns: { name: 'props:id', prefix: 'props', localName: 'id' },
          inherited: true
        },
        'props:id': {
          name: 'id',
          type: 'String',
          isAttr: true,
          isId: true,
          ns: { name: 'props:id', prefix: 'props', localName: 'id' },
          inherited: true
        }
      };

      // when
      var ComplexType = model.getType('props:Complex');

      var descriptor = model.getElementDescriptor(ComplexType);

      // then
      expect(descriptor).to.exist;
      expect(descriptor.name).to.equal('props:Complex');

      expect(descriptor.ns).to.jsonEqual(expectedDescriptorNs);
      expect(descriptor.properties).to.jsonEqual(expectedDescriptorProperties);
      expect(descriptor.propertiesByName).to.jsonEqual(expectedDescriptorPropertiesByName);
    });


    it('should provide type descriptor via $descriptor property', function() {

      // given
      var ComplexType = model.getType('props:Complex');
      var expectedDescriptor = model.getElementDescriptor(ComplexType);

      // when
      var descriptor = ComplexType.$descriptor;

      // then
      expect(descriptor).to.equal(expectedDescriptor);
    });


    it('should provide model via $model property', function() {

      // given
      var ComplexType = model.getType('props:Complex');

      // when
      var foundModel = ComplexType.$model;

      // then
      expect(foundModel).to.equal(model);
    });


    describe('create', function() {

      it('should provide meta-data', function() {

        // when
        var instance = model.create('props:BaseWithNumericId');

        // then
        expect(instance.$descriptor).to.exist;
        expect(instance.$type).to.equal('props:BaseWithNumericId');
      });

    });


    describe('createAny', function() {

      it('should provide attrs + basic meta-data', function() {

        // when
        var anyInstance = model.createAny('other:Foo', 'http://other', {
          bar: 'BAR'
        });

        // then
        expect(anyInstance).to.jsonEqual({
          $type: 'other:Foo',
          bar: 'BAR'
        });

        expect(anyInstance.$instanceOf('other:Foo')).to.be.true;
      });


      it('should provide ns meta-data', function() {

        // when
        var anyInstance = model.createAny('other:Foo', 'http://other', {
          bar: 'BAR'
        });

        // then
        expect(anyInstance.$descriptor).to.jsonEqual({
          name: 'other:Foo',
          isGeneric: true,
          ns: { prefix : 'other', localName : 'Foo', uri : 'http://other' }
        });
      });


      it('should return non-enumerable special props', function() {

        // given
        var anyInstance = model.createAny('other:Foo', 'http://other', {
          bar: 'BAR'
        });

        // assume
        expect(anyInstance).not.to.have.keys([
          '$parent',
          '$instanceOf'
        ]);

        // when
        anyInstance.$parent = 'foo';
        anyInstance.$instanceOf = 'bar';

        // then
        expect(anyInstance).not.to.have.keys([
          '$parent',
          '$instanceOf'
        ]);
      });

    });


    describe('getType', function() {

      it('should provide instantiatable type', function() {

        // when
        var SimpleBody = model.getType('props:SimpleBody');

        var instance = new SimpleBody({ body: 'BAR' });

        // then
        expect(instance instanceof SimpleBody).to.be.true;
        expect(instance.body).to.eql('BAR');
      });

    });


    describe('instance', function() {

      it('should query types via $instanceOf', function() {

        // given
        var instance = model.create('props:BaseWithNumericId');

        // then
        expect(instance.$instanceOf('props:BaseWithNumericId')).to.equal(true);
        expect(instance.$instanceOf('props:Base')).to.equal(true);
      });


      it('should provide $type in instance', function() {

        // given
        var SimpleBody = model.getType('props:SimpleBody');

        // when
        var instance = new SimpleBody();

        // then
        expect(instance.$type).to.equal('props:SimpleBody');
      });


      it('should provide $descriptor in instance', function() {

        // given
        var SimpleBody = model.getType('props:SimpleBody');

        // when
        var instance = new SimpleBody();

        // then
        expect(instance.$descriptor).to.eql(SimpleBody.$descriptor);
      });

    });


    describe('helpers', function() {

      it('should get property descriptor', function() {
        // given
        var SimpleBody = model.getType('props:SimpleBody');

        var instance = new SimpleBody();

        // when
        var body = model.getPropertyDescriptor(instance, 'props:body');

        // then
        expect(body).to.include.keys([ 'name', 'type', 'isBody', 'ns' ]);
      });


      it('should get type descriptor', function() {

        // when
        var simpleBody = model.getTypeDescriptor('props:SimpleBody');

        // then
        expect(simpleBody).to.include.keys([ 'name', 'superClass', 'properties' ]);
      });

    });

  });


  describe('error handling', function() {

    it('should handle package redefinition', function() {

      // given
      function create() {

        // when
        createModel([ 'properties', 'properties' ]);
      }

      // then
      expect(create).to.throw(/package with prefix <props> already defined/);

    });

  });

});
