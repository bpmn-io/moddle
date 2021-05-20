import expect from '../expect';

import {
  createModelBuilder
} from '../helper';

describe('properties', function() {

  var createModel = createModelBuilder('test/fixtures/model/');
  var model = createModel([ 'properties', 'properties-extended' ]);


  describe('descriptor', function() {

    it('should provide id property', function() {

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


    it('should inherit properties', function() {

      // when
      var ExtRoot = model.getType('ext:Root');

      var descriptor = model.getElementDescriptor(ExtRoot);
      var elementsProperty = descriptor.propertiesByName.elements;
      var inheritedAnyProperty = descriptor.propertiesByName.any;

      // then
      expect(ExtRoot).to.exist;
      expect(elementsProperty).to.exist;
      expect(inheritedAnyProperty).to.exist;
    });


    it('should NOT add already defined property without redefine', function() {

      // when
      var getType = function() {
        model.getType('props:BaseWithAlreadyDefinedId');
      };

      // then
      expect(getType).to.throw('property <id> already defined; override of ' +
                               '<props:BaseWithId#props:id> by ' +
                               '<props:BaseWithAlreadyDefinedId#props:id> ' +
                               'not allowed without redefines');
    });

  });


  describe('instance', function() {

    it('should set simple properties in constructor', function() {

      // when
      var attributes = model.create('props:Attributes', {
        id: 'ATTR_1',
        booleanValue: false,
        integerValue: -1000
      });

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


    it.skip('should set collection properties in constructor');


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

  describe('multiple inherited', function() {

    // given

    // Moddle instance with multiple superClasses partly from different
    // namespaces.
    var mhModel = createModel([
      'properties',
      'multiple-inherited-properties'
    ]);

    it('should provide Type', function() {

      // when
      var getType = function() {
        mhModel.getType('mh:MultipleInherited');
      };

      // then
      expect(getType).to.not.throw();

      var Type = eval(getType);
      expect(Type).to.exist;
    });

    describe('Type', function() {

      // given
      var Type = mhModel.getType('mh:MultipleInherited');

      it('should provide descriptor', function() {

        // when
        var getDescriptor = function() {
          mhModel.getElementDescriptor(Type);
        };

        // then
        expect(getDescriptor).to.not.throw();

        var descriptor = eval(getDescriptor);
        expect(descriptor).to.exist;
      });

      describe('descriptor', function() {

        // given
        var descriptor = mhModel.getElementDescriptor(Type);

        it('should describe propertiesByName', function() {

          // when
          var properties = descriptor.propertiesByName;

          // then
          expect(properties.any).to.exist;
          expect(properties['mh:any']).to.exist;
          expect(properties['props:any']).to.exist;

          expect(properties.many).to.exist;
          expect(properties['mh:many']).to.exist;
          expect(properties['props:many']).to.exist;

          expect(properties.single).to.exist;
          expect(properties['mh:single']).to.exist;
          expect(properties['props:single']).to.exist;

          expect(properties.defaultSingle).to.exist;
          expect(properties['mh:defaultSingle']).to.exist;
          expect(properties['props:defaultSingle']).to.exist;
        });

      }); // describe(multiple inherited/Type/descriptor)

    }); // describe(multiple inherited/Type)

    describe('instance', function() {

      it('should be created', function() {

        // when
        var instance = mhModel.create('mh:MultipleInherited');

        // then
        expect(instance).to.exist;
      });

      describe('non-many', function() {

        describe('default', function() {

          // given
          var instance = mhModel.create('mh:MultipleInherited');

          // when
          var originalProperty = instance.defaultSingle;

          // Note: access to local and other name ONLY with 'get()'. Not
          // mapped into the object!

          var localProperty = instance.get('mh:defaultSingle');
          var otherProperty = instance['props:defaultSingle'];
          // var otherProperty = instance.get('props:defaultSingle');

          it('should exist', function() {

            // then
            expect(originalProperty).to.exist;
            expect(localProperty).to.exist;
            expect(otherProperty).to.exist;
          });

          it('should hold different values', function() {

            // then
            expect(originalProperty).to.equal('mh-default-string');
            expect(otherProperty).to.equal(42);
            expect(originalProperty).to.eql(localProperty);
          });

        }); // describe(multiple inherited/instance/non-many/default)

        describe('initialize with create', function() {

          it('should initialize values via original name', function() {

            // given
            var instance = mhModel.create('mh:MultipleInherited', {
              single: 'non-default-string',
              'props:single': 23
            });

            // when
            var originalProperty = instance.single;

            // Note: access to local name ALWAYS ONLY with 'get()'. Not mapped
            // into the object!

            var localProperty = instance.get('mh:single');
            var otherProperty = instance['props:single'];

            // then
            expect(originalProperty).to.equal('non-default-string');
            expect(otherProperty).to.equal(23);
            expect(originalProperty).to.eql(localProperty);
          });

          it('should initialize values via local name', function() {

            // given
            var instance = mhModel.create('mh:MultipleInherited', {
              'mh:single': 'mh-non-default-string',
              'props:single': 23
            });

            // when
            var originalProperty = instance.single;
            var localProperty = instance.get('mh:single');
            var otherProperty = instance['props:single'];

            // then
            expect(originalProperty).to.equal('mh-non-default-string');
            expect(otherProperty).to.equal(23);
            expect(originalProperty).to.eql(localProperty);
          });

        }); // describe(multiple inherited/instance/non-many/initialize with create)

      }); // describe(multiple inherited/instance/non-many)

      describe('many', function() {

        describe('initialize with create', function() {

          it('should initialize values via original name', function() {

            // given
            var instance = mhModel.create('mh:MultipleInherited', {
              many: [ 'mh-original-string' ],
              'props:many': [ 23 ]
            });

            // when
            var originalProperty = instance.many;
            var localProperty = instance.get('mh:many');
            var otherProperty = instance['props:many'];

            // then
            expect(originalProperty).to.exist;
            expect(localProperty).to.exist;
            expect(otherProperty).to.exist;

            expect(originalProperty.length).to.equal(1);
            expect(originalProperty).to.eql([ 'mh-original-string' ]);

            expect(otherProperty.length).to.equal(1);
            expect(otherProperty).to.eql([ 23 ]);

            expect(originalProperty).to.eql(localProperty);
          });

          it('should initialize values via local name', function() {

            // given
            var instance = mhModel.create('mh:MultipleInherited', {
              'mh:many': [ 'mh-local-string' ],
              'props:many': [ 23 ]
            });

            // when
            var originalProperty = instance.many;
            var localProperty = instance.get('mh:many');
            var otherProperty = instance['props:many'];

            // then
            expect(localProperty.length).to.equal(1);
            expect(localProperty).to.eql([ 'mh-local-string' ]);

            expect(otherProperty.length).to.equal(1);
            expect(otherProperty).to.eql([ 23 ]);

            expect(originalProperty).to.eql(localProperty);
          });

        }); // describe(multiple inherited/instance/many/initialize with create)

        describe('get', function() {

          // given
          var instance = mhModel.create('mh:MultipleInherited', {
            many: [ 'mh-original-string' ],
            'props:many': [ 23 ]
          });

          // when
          var originalProperty = instance.get('many');
          var localProperty = instance.get('mh:many');
          var otherProperty = instance.get('props:many');


          it('should modify via original name', function() {

            // then
            expect(originalProperty).to.eql([ 'mh-original-string' ]);
            expect(originalProperty).to.eql(localProperty);
          });


          it('should modify via local name', function() {

            // then
            expect(localProperty).to.eql([ 'mh-original-string' ]);
            expect(localProperty).to.eql(localProperty);
          });


          it('should modify via other name', function() {

            // then
            expect(otherProperty).to.eql([ 23 ]);
          });

        }); // describe(multiple inherited properties/instance/many/get)

        describe('set', function() {

          it('should modify via original name', function() {

            // given
            var instance = mhModel.create('mh:MultipleInherited');

            // when
            instance.set('many', [ 'test-many' ]);
            instance.set('props:many', [ 23 ]);

            var originalProperty = instance.get('many');
            var localProperty = instance.get('mh:many');
            var otherProperty = instance.get('props:many');

            // then
            expect(originalProperty.length).to.equal(1);
            expect(originalProperty).to.eql([ 'test-many' ]);

            expect(otherProperty.length).to.equal(1);
            expect(otherProperty).to.eql([ 23 ]);

            expect(originalProperty).to.eql(localProperty);
          });

          it('should modify via local name', function() {

            // given
            var instance = mhModel.create('mh:MultipleInherited');

            // when
            instance.set('mh:many', [ 'test-many' ]);
            instance.set('props:many', [ 23 ]);

            var originalProperty = instance.get('many');
            var localProperty = instance.get('mh:many');
            var otherProperty = instance.get('props:many');

            // then
            expect(originalProperty.length).to.equal(1);
            expect(originalProperty).to.eql([ 'test-many' ]);

            expect(otherProperty.length).to.equal(1);
            expect(otherProperty).to.eql([ 23 ]);

            expect(originalProperty).to.eql(localProperty);
          });

        }); // describe(multiple inherited properties/instance/many/set)

      }); // describe(multiple inherited/instance/instance/many)

    }); // describe(multiple inherited properties/instance)

  }); // describe(multiple inherited properties)

});
