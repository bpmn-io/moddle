'use strict';

var _ = require('lodash');

var Helper = require('./Helper');


describe('Moddle', function() {

  beforeEach(Helper.addMatchers);

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
      expect(ComplexType).toBeDefined();
      expect(SimpleBody).toBeDefined();
      expect(Attributes).toBeDefined();
    });


    it('should provide packages by prefix', function() {

      // given

      // when
      var propertiesPackage = model.getPackage('props');

      // then
      expect(propertiesPackage).toBeDefined();
      expect(propertiesPackage.name).toBe('Properties');
      expect(propertiesPackage.uri).toBe('http://properties');
      expect(propertiesPackage.prefix).toBe('props');
    });


    it('should provide packages by uri', function() {

      // given

      // when
      var propertiesPackage = model.getPackage('http://properties');

      // then
      expect(propertiesPackage).toBeDefined();
      expect(propertiesPackage.name).toBe('Properties');
      expect(propertiesPackage.uri).toBe('http://properties');
      expect(propertiesPackage.prefix).toBe('props');
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
      expect(descriptor).toBeDefined();
      expect(descriptor.name).toBe('props:Complex');

      expect(descriptor.ns).toDeepEqual(expectedDescriptorNs);
      expect(descriptor.properties).toDeepEqual(expectedDescriptorProperties);
      expect(descriptor.propertiesByName).toDeepEqual(expectedDescriptorPropertiesByName);
    });


    it('should provide type descriptor via $descriptor property', function() {

      // given
      var ComplexType = model.getType('props:Complex');
      var expectedDescriptor = model.getElementDescriptor(ComplexType);

      // when
      var descriptor = ComplexType.$descriptor;

      // then
      expect(descriptor).toBe(expectedDescriptor);
    });


    it('should provide model via $model property', function() {

      // given
      var ComplexType = model.getType('props:Complex');

      // when
      var foundModel = ComplexType.$model;

      // then
      expect(foundModel).toBe(model);
    });


    describe('instance', function() {

      it('should query types via $instanceOf', function() {

        // given
        var instance = model.create('props:BaseWithNumericId');

        // then
        expect(instance.$instanceOf('props:BaseWithNumericId')).toBe(true);
        expect(instance.$instanceOf('props:Base')).toBe(true);
      });
    });
  });


  describe('create', function() {

    it('should provide meta-data', function() {
      // given

      // when
      var instance = model.create('props:BaseWithNumericId');

      // then
      expect(instance.$descriptor).toBeDefined();
      expect(instance.$type).toBe('props:BaseWithNumericId');
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
      expect(anyInstance).toDeepEqual({
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
      expect(anyInstance.$descriptor).toDeepEqual({
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
      expect(instance.$type).toBe('props:SimpleBody');
    });


    it('should provide type descriptor in instance', function() {

      // given
      var SimpleBody = model.getType('props:SimpleBody');

      // when
      var instance = new SimpleBody();

      // then
      expect(instance.$descriptor).toEqual(SimpleBody.$descriptor);
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
        expect(idProperty).toBeDefined();
        expect(descriptor.properties.indexOf(idProperty)).toBe(0);
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
        expect(attributes.id).toBe('ATTR_1');
        expect(attributes.booleanValue).toBe(false);
        expect(attributes.integerValue).toBe(-1000);
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
        expect(referencingCollection.references).toDeepEqual([ reference1, reference2 ]);

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
        expect(containedCollection.children).toDeepEqual([ child1, child2 ]);

        // TODO: establish parent relationship
      });


      it('should provide default values', function() {

        // given
        var Attributes = model.getType('props:Attributes');

        // when
        var instance = new Attributes();

        // then
        expect(instance.defaultBooleanValue).toBe(true);
      });


      it('should provide inherited default values', function() {

        // given
        var SubAttributes = model.getType('props:SubAttributes');

        // when
        var instance = new SubAttributes();

        // then
        expect(instance.defaultBooleanValue).toBe(true);
      });


      xit('should set collection properties in constructor');


      it('should lazy init collection properties', function() {

        // given
        var Root = model.getType('props:Root');
        var instance = new Root();

        // assume
        expect(instance.any).not.toBeDefined();

        // when
        var any = instance.get('props:any');

        // then
        expect(any).toEqual([]);
        expect(instance.any).toBe(any);
      });


      it('should set single property', function() {

        // given
        var Attributes = model.getType('props:Attributes');
        var instance = new Attributes();

        // when
        instance.set('id', 'ATTR_1');

        // then
        expect(instance.id).toBe('ATTR_1');
      });


      it('should set single property (ns)', function() {

        // given
        var Attributes = model.getType('props:Attributes');
        var instance = new Attributes();

        // when
        instance.set('props:booleanValue', true);
        instance.set('props:integerValue', -1000);

        // then
        expect(instance.booleanValue).toBe(true);
        expect(instance.integerValue).toBe(-1000);
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
        expect(refinedIdProperty).not.toDeepEqual(originalIdProperty);

        expect(refinedIdProperty).toBeDefined();
        expect(refinedIdProperty).toEqual(numericIdProperty);
      });


      describe('instance', function() {

        it('init in constructor', function() {

          // given
          var BaseWithNumericId = model.getType('props:BaseWithNumericId');

          // when
          var instance = new BaseWithNumericId({ 'id': 1000 });

          // then
          expect(instance.idNumeric).toBe(1000);
        });


        it('access via original name', function() {

          // given
          var BaseWithNumericId = model.getType('props:BaseWithNumericId');

          // when
          var instance = new BaseWithNumericId({ 'id': 1000 });

          // then
          expect(instance.get('props:id')).toBe(1000);
        });


        it('should return $attrs property on non-metamodel defined property access', function() {

          // given
          var BaseWithNumericId = model.getType('props:BaseWithNumericId');

          // when
          var instance = new BaseWithNumericId({ 'id': 1000 });

          instance.$attrs.unknown = 'UNKNOWN';

          // then
          expect(instance.get('unknown')).toEqual('UNKNOWN');
        });


        it('access via original name', function() {

          // given
          var BaseWithNumericId = model.getType('props:BaseWithNumericId');

          // when
          var instance = new BaseWithNumericId({ 'id': 1000 });

          // then
          expect(instance.get('props:idNumeric')).toBe(1000);
        });

      });

    });

  });

});