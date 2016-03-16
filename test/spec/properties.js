'use strict';

var Helper = require('../helper');


describe('properties', function() {

  var createModel = Helper.createModelBuilder('test/fixtures/model/');
  var model = createModel([ 'properties' ]);


  describe('descriptor', function() {

    it('should provide body property', function() {

      // when
      var Complex = model.getType('props:Complex');

      var descriptor = model.getElementDescriptor(Complex);
      var idProperty = descriptor.propertiesByName.id;

      // then
      expect(idProperty).to.exist;
      expect(idProperty.isId).to.be.true;

      expect(descriptor.idProperty).to.eql(idProperty);
    });


    it('should provide body property', function() {

      // when
      var SimpleBody = model.getType('props:SimpleBody');

      var descriptor = model.getElementDescriptor(SimpleBody);
      var bodyProperty = descriptor.propertiesByName.body;

      // then
      expect(bodyProperty).to.exist;
      expect(bodyProperty.isBody).to.be.true;

      expect(descriptor.bodyProperty).to.eql(bodyProperty);
    });


    it('should NOT provide default id', function() {

      // when
      var SimpleBody = model.getType('props:SimpleBody');

      var descriptor = model.getElementDescriptor(SimpleBody);
      var idProperty = descriptor.propertiesByName.id;

      // then
      expect(idProperty).not.to.exist;
    });


    xit('should inherit properties');

  });


  describe('instance', function() {

    it('should set simple properties in constructor', function() {

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


    describe('set', function() {

      it('should set property', function() {

        // given
        var instance = model.create('props:Attributes');

        // when
        instance.set('id', 'ATTR_1');

        // then
        expect(instance.id).to.equal('ATTR_1');
      });


      it('should set property (ns)', function() {

        // given
        var instance = model.create('props:Attributes');

        // when
        instance.set('props:booleanValue', true);
        instance.set('props:integerValue', -1000);

        // then
        expect(instance.booleanValue).to.equal(true);
        expect(instance.integerValue).to.equal(-1000);
      });


      it('should set extension property', function() {

        // given
        var instance = model.create('props:Attributes');

        // when
        instance.set('foo', 'bar');

        // then
        expect(instance.$attrs).to.have.property('foo', 'bar');
        expect(instance).not.to.have.keys('foo');
      });


      it('should set extension property (ns)', function() {

        // given
        var instance = model.create('props:Attributes');

        // when
        instance.set('namespace:foo', 'bar');

        // then
        expect(instance.$attrs).to.have.property('namespace:foo', 'bar');
        expect(instance).not.to.have.keys('foo', 'namespace:foo');
      });

    });


    describe('update', function() {

      it('should update property', function() {

        // given
        var attributes = model.create('props:Attributes', { id: 'ATTR_1' });

        // when
        attributes.set('id', 'ATTR_23');

        // then
        expect(attributes.id).to.equal('ATTR_23');
      });


      it('should update property (ns)', function() {

        // given
        var attributes = model.create('props:Attributes', { 'props:integerValue': -1000 });

        // when
        attributes.set('props:integerValue', 1024);

        // then
        expect(attributes.integerValue).to.equal(1024);
      });


      it('should update extension property', function() {

        // given
        var attributes = model.create('props:Attributes', { 'foo': 'bar' });

        // when
        attributes.set('foo', 'baz');

        // then
        expect(attributes.$attrs.foo).to.equal('baz');
      });


      it('should update extension property (ns)', function() {

        // given
        var attributes = model.create('props:Attributes', { 'foo:bar': 'baz' });

        // when
        attributes.set('foo:bar', 'qux');

        // then
        expect(attributes.$attrs).to.have.property('foo:bar', 'qux');
      });

    });


    describe('unset', function() {

      it('should unset property', function() {

        // given
        var attributes = model.create('props:Attributes', { id: 'ATTR_1' });

        // assume
        expect(attributes.id).to.equal('ATTR_1');

        // when
        attributes.set('id', undefined);

        // then
        expect(attributes).not.to.have.property('id');
      });


      it('should unset property (ns)', function() {

        // given
        var attributes = model.create('props:Attributes', {
          'props:integerValue': -1000
        });

        // assume
        expect(attributes.integerValue).to.equal(-1000);

        // when
        attributes.set('props:integerValue', undefined);

        // then
        expect(attributes).not.to.have.keys('integerValue', 'props:integerValue');
      });


      it('should unset extension property', function() {

        // given
        var attributes = model.create('props:Attributes', {
          'foobar': 42
        });

        // assume
        expect(attributes.$attrs.foobar).to.equal(42);

        // when
        attributes.set('foobar', undefined);

        // then
        expect(attributes.$attrs).not.to.have.keys('foobar');
      });


      it('should unset extension property (ns)', function() {

        // given
        var attributes = model.create('props:Attributes', {
          'foo:bar': 42
        });

        // assume
        expect(attributes.$attrs['foo:bar']).to.equal(42);

        // when
        attributes.set('foo:bar', undefined);

        // then
        expect(attributes.$attrs).not.to.have.keys('foo:bar');
      });

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

      var originalIdProperty = baseDescriptor.propertiesByName.id;

      var refinedIdProperty = redefinedDescriptor.propertiesByName.id;
      var numericIdProperty = redefinedDescriptor.propertiesByName.idNumeric;

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