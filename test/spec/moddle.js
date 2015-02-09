'use strict';

var Helper = require('../helper');


describe('moddle', function() {

  var createModel = Helper.createModelBuilder('test/fixtures/model/');
  var model = createModel([ 'properties' ]);


  describe('api', function() {

    it('should provide types', function() {

      // given

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

      // given

      // when
      var propertiesPackage = model.getPackage('props');

      // then
      expect(propertiesPackage).to.exist;
      expect(propertiesPackage.name).to.equal('Properties');
      expect(propertiesPackage.uri).to.equal('http://properties');
      expect(propertiesPackage.prefix).to.equal('props');
    });


    it('should provide packages by uri', function() {

      // given

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
        { name: 'id', type: 'String', isAttr: true, ns: { name: 'props:id', prefix: 'props', localName: 'id' } }
      ];

      var expectedDescriptorPropertiesByName = {

        'id': { name: 'id', type: 'String', isAttr: true, ns: { name: 'props:id', prefix: 'props', localName: 'id' } },
        'props:id': { name: 'id', type: 'String', isAttr: true, ns: { name: 'props:id', prefix: 'props', localName: 'id' } }
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


    describe('instance', function() {

      it('should query types via $instanceOf', function() {

        // given
        var instance = model.create('props:BaseWithNumericId');

        // then
        expect(instance.$instanceOf('props:BaseWithNumericId')).to.equal(true);
        expect(instance.$instanceOf('props:Base')).to.equal(true);
      });
    });
  });


  describe('create', function() {

    it('should provide meta-data', function() {
      // given

      // when
      var instance = model.create('props:BaseWithNumericId');

      // then
      expect(instance.$descriptor).to.exist;
      expect(instance.$type).to.equal('props:BaseWithNumericId');
    });

  });


  describe('createAny', function() {

    it('should provide attrs + basic meta-data', function() {
      // given

      // when
      var anyInstance = model.createAny('other:Foo', 'http://other', {
        bar: 'BAR'
      });

      // then
      expect(anyInstance).to.jsonEqual({
        $type: 'other:Foo',
        bar: 'BAR'
      });
    });


    it('should provide ns meta-data', function() {
      // given

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

  });


  describe('base', function() {

    it('should provide type in instance', function() {

      // given
      var SimpleBody = model.getType('props:SimpleBody');

      // when
      var instance = new SimpleBody();

      // then
      expect(instance.$type).to.equal('props:SimpleBody');
    });


    it('should provide type descriptor in instance', function() {

      // given
      var SimpleBody = model.getType('props:SimpleBody');

      // when
      var instance = new SimpleBody();

      // then
      expect(instance.$descriptor).to.eql(SimpleBody.$descriptor);
    });

  });


  describe('properties', function() {

    describe('descriptor', function() {

      it('should provide default id', function() {

        // given

        // when
        var SimpleBody = model.getType('props:SimpleBody');

        var descriptor = model.getElementDescriptor(SimpleBody);
        var idProperty = descriptor.propertiesByName['id'];

        // then
        expect(idProperty).to.exist;
        expect(descriptor.properties.indexOf(idProperty)).to.equal(0);
      });

      xit('should inherit properties');

    });


    describe('instance', function() {

      it('should set simple properties in constructor', function() {

        // given

        // when
        var attributes = model.create('props:Attributes', { id: 'ATTR_1', booleanValue: false, integerValue: -1000 });

        // then
        // expect constructor to have set values
        expect(attributes.id).to.equal('ATTR_1');
        expect(attributes.booleanValue).to.equal(false);
        expect(attributes.integerValue).to.equal(-1000);
      });


      it('should set collection properties in constructor (referencing)', function() {

        // given

        // given
        var reference1 = model.create('props:ComplexCount');
        var reference2 = model.create('props:ComplexNesting');

        // when
        var referencingCollection = model.create('props:ReferencingCollection', {
          references: [ reference1, reference2 ]
        });

        // then
        expect(referencingCollection.references).to.jsonEqual([ reference1, reference2 ]);

        // TODO: validate not parent -> child relationship
      });


      it('should set collection properties in constructor (containment)', function() {

        // given
        var child1 = model.create('props:ComplexCount');
        var child2 = model.create('props:ComplexNesting');

        // when
        var containedCollection = model.create('props:ContainedCollection', {
          children: [ child1, child2 ]
        });

        // then
        expect(containedCollection.children).to.jsonEqual([ child1, child2 ]);

        // TODO: establish parent relationship
      });


      it('should provide default values', function() {

        // given
        var Attributes = model.getType('props:Attributes');

        // when
        var instance = new Attributes();

        // then
        expect(instance.defaultBooleanValue).to.equal(true);
      });


      it('should provide inherited default values', function() {

        // given
        var SubAttributes = model.getType('props:SubAttributes');

        // when
        var instance = new SubAttributes();

        // then
        expect(instance.defaultBooleanValue).to.equal(true);
      });


      xit('should set collection properties in constructor');


      it('should lazy init collection properties', function() {

        // given
        var Root = model.getType('props:Root');
        var instance = new Root();

        // assume
        expect(instance.any).not.to.exist;

        // when
        var any = instance.get('props:any');

        // then
        expect(any).to.eql([]);
        expect(instance.any).to.equal(any);
      });


      it('should set single property', function() {

        // given
        var Attributes = model.getType('props:Attributes');
        var instance = new Attributes();

        // when
        instance.set('id', 'ATTR_1');

        // then
        expect(instance.id).to.equal('ATTR_1');
      });


      it('should set single property (ns)', function() {

        // given
        var Attributes = model.getType('props:Attributes');
        var instance = new Attributes();

        // when
        instance.set('props:booleanValue', true);
        instance.set('props:integerValue', -1000);

        // then
        expect(instance.booleanValue).to.equal(true);
        expect(instance.integerValue).to.equal(-1000);
      });

    });


    describe('should redefine property', function() {

      it('descriptor', function() {

        // given

        // when
        var BaseWithId = model.getType('props:BaseWithId');
        var BaseWithNumericId = model.getType('props:BaseWithNumericId');

        var baseDescriptor = BaseWithId.$descriptor;
        var redefinedDescriptor = BaseWithNumericId.$descriptor;

        var originalIdProperty = baseDescriptor.propertiesByName['id'];

        var refinedIdProperty = redefinedDescriptor.propertiesByName['id'];
        var numericIdProperty = redefinedDescriptor.propertiesByName['idNumeric'];

        // then
        expect(refinedIdProperty).not.to.jsonEqual(originalIdProperty);

        expect(refinedIdProperty).to.exist;
        expect(refinedIdProperty).to.eql(numericIdProperty);
      });


      describe('instance', function() {

        it('init in constructor', function() {

          // given
          var BaseWithNumericId = model.getType('props:BaseWithNumericId');

          // when
          var instance = new BaseWithNumericId({ 'id': 1000 });

          // then
          expect(instance.idNumeric).to.equal(1000);
        });


        it('access via original name', function() {

          // given
          var BaseWithNumericId = model.getType('props:BaseWithNumericId');

          // when
          var instance = new BaseWithNumericId({ 'id': 1000 });

          // then
          expect(instance.get('props:id')).to.equal(1000);
        });


        it('should return $attrs property on non-metamodel defined property access', function() {

          // given
          var BaseWithNumericId = model.getType('props:BaseWithNumericId');

          // when
          var instance = new BaseWithNumericId({ 'id': 1000 });

          instance.$attrs.unknown = 'UNKNOWN';

          // then
          expect(instance.get('unknown')).to.eql('UNKNOWN');
        });


        it('access via original name', function() {

          // given
          var BaseWithNumericId = model.getType('props:BaseWithNumericId');

          // when
          var instance = new BaseWithNumericId({ 'id': 1000 });

          // then
          expect(instance.get('props:idNumeric')).to.equal(1000);
        });

      });

    });

  });

});