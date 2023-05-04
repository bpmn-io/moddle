import expect from '../expect.js';

import {
  createModelBuilder
} from '../helper.js';


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


      it('should have getters', function() {

        // when
        var anyInstance = model.createAny('other:Foo', 'http://other', {
          bar: 'BAR'
        });

        // then
        expect(anyInstance.get('bar')).to.eql('BAR');
      });


      it('should have setters', function() {

        // given
        var anyInstance = model.createAny('other:Foo', 'http://other');

        // when
        anyInstance.set('bar', 'BAR');

        // then
        expect(anyInstance.get('bar')).to.eql('BAR');
      });


      it('should prevent prototype pollution', function() {

        // given
        var anyInstance = model.createAny('other:Foo', 'http://other');

        // when

        expect(function() {
          anyInstance.set('__proto__', { hacked() { console.log('hacked'); } });
        }).to.throw('illegal key: __proto__');

      });


      it('should NOT allow array as key', function() {

        // given
        var anyInstance = model.createAny('other:Foo', 'http://other');

        // when
        expect(function() {
          anyInstance.set([ 'path', 'to', 'key' ], 'value');
        }).to.throw('illegal key type: object. Key should be of type number or string.');
      });


      it('should mark accessors as special props', function() {

        // given
        var anyInstance = model.createAny('other:Foo', 'http://other', {
          bar: 'BAR'
        });

        // then
        expect(anyInstance).not.to.have.keys([
          'get',
          'set'
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


  describe('property access', function() {

    const moddle = createModel([
      'properties',
      'properties-extended'
    ]);


    describe('typed', function() {

      it('should access basic', function() {

        // when
        const element = moddle.create('props:ComplexCount', {
          count: 10
        });

        // then
        expect(element.get('count')).to.eql(10);
        expect(element.get('props:count')).to.eql(10);

        // available under base name
        expect(element.count).to.exist;
      });


      it('should access refined property, created via base name', function() {

        // when
        const element = moddle.create('ext:ExtendedComplex', {
          count: 10
        });

        // then
        expect(element.get('numCount')).to.eql(10);
        expect(element.get('ext:numCount')).to.eql(10);
        expect(element.get('count')).to.eql(10);
        expect(element.get('props:count')).to.eql(10);

        // available under refined name
        expect(element.numCount).to.eql(10);
        expect(element.count).not.to.exist;
      });


      it('should access refined property, created via refined name', function() {

        // when
        const element = moddle.create('ext:ExtendedComplex', {
          numCount: 10
        });

        // then
        expect(element.get('numCount')).to.eql(10);
        expect(element.get('ext:numCount')).to.eql(10);
        expect(element.get('count')).to.eql(10);
        expect(element.get('props:count')).to.eql(10);

        // available under refined name
        expect(element.numCount).to.eql(10);
        expect(element.count).not.to.exist;
      });


      it('should access global name', function() {

        // when
        const element = moddle.create('props:ComplexCount', {
          ':xmlns': 'http://foo'
        });

        // then
        expect(element.get(':xmlns')).to.eql('http://foo');
        expect(element.get('xmlns')).to.eql('http://foo');

        // available as extension attribute
        expect(element.$attrs).to.have.property('xmlns');
      });


      it('should access global name (no prefix)', function() {

        // when
        const element = moddle.create('props:ComplexCount', {
          'xmlns': 'http://foo'
        });

        // then
        expect(element.get(':xmlns')).to.eql('http://foo');
        expect(element.get('xmlns')).to.eql('http://foo');

        // available as extension attribute
        expect(element.$attrs).to.have.property('xmlns');
      });

    });


    describe('any', function() {

      it('should access property', function() {

        // when
        const element = moddle.createAny('foo:Bar', 'http://tata', {
          count: 10
        });

        // then
        expect(element['count']).to.eql(10);
      });

    });

  });


  describe('property access (lax)', function() {

    const moddle = createModel([
      'properties'
    ], {
      strict: false
    });


    describe('typed', function() {

      it('should access unknown attribute', function() {

        // when
        const element = moddle.create('props:ComplexCount', {
          foo: 'bar'
        });

        // then
        expect(element.get('foo')).to.eql('bar');
      });

    });

  });


  describe('property access (strict)', function() {

    const moddle = createModel([
      'properties'
    ], {
      strict: true
    });


    it('should configure in strict mode', function() {

      // then
      expect(moddle.config.strict).to.be.true;
    });


    describe('typed', function() {

      it('should access basic', function() {

        // when
        const element = moddle.create('props:ComplexCount', {
          count: 10
        });

        // then
        expect(element.get('count')).to.eql(10);
        expect(element.get('props:count')).to.eql(10);

        // available under base name
        expect(element.count).to.exist;
      });


      it('should access global name', function() {

        // when
        const element = moddle.create('props:ComplexCount', {
          ':xmlns': 'http://foo'
        });

        // then
        expect(element.get(':xmlns')).to.eql('http://foo');

        expect(() => {
          element.get('xmlns');
        }).to.throw(/unknown property <xmlns> on <props:ComplexCount>/);

        // available as extension attribute
        expect(element.$attrs).to.have.property('xmlns');
      });


      it('fail accessing unknown property', function() {

        // when
        const element = moddle.create('props:ComplexCount');

        // then
        expect(() => {
          element.get('foo');
        }).to.throw(/unknown property <foo> on <props:ComplexCount>/);

        expect(() => {
          element.set('foo', 10);
        }).to.throw(/unknown property <foo> on <props:ComplexCount>/);
      });


      it('fail instantiating with unknown property', function() {

        // then
        expect(() => {
          moddle.create('props:ComplexCount', {
            foo: 10
          });
        }).to.throw(/unknown property <foo> on <props:ComplexCount>/);
      });

    });

  });

});
