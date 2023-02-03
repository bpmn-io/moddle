import { forEach } from 'min-dash';

import expect from '../expect.js';

import {
  createModelBuilder,
  getEffectiveDescriptor
} from '../helper.js';


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


    describe('should inherit', function() {

      it('single parent', function() {

        // when
        var descriptor = getEffectiveDescriptor(model, 'ext:Root');

        var propertiesByName = descriptor.propertiesByName;

        // then
        expect(propertiesByName).to.include.keys([
          'any',
          'elements'
        ]);

        // then
        expect(propertiesByName['elements']).to.have.property('inherited', true);
        expect(propertiesByName['any']).to.have.property('inherited', true);
      });


      it('multiple parents', function() {

        // when
        var descriptor = getEffectiveDescriptor(model, 'props:MultipleSuper');

        var propertiesByName = descriptor.propertiesByName;

        // then
        expect(propertiesByName).to.include.keys([
          'id',
          'body'
        ]);

        // then
        expect(propertiesByName['id']).to.have.property('inherited', true);
        expect(propertiesByName['body']).to.have.property('inherited', true);
      });

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


    describe('should set collection properties in constructor', function() {

      it('referencing', function() {

        // given
        var reference1 = model.create('props:ComplexCount');
        var reference2 = model.create('props:ComplexNesting');

        // when
        var referencingCollection = model.create('props:ReferencingCollection', {
          references: [ reference1, reference2 ]
        });

        // then
        expect(referencingCollection.references).to.jsonEqual([ reference1, reference2 ]);

        expect(reference1.$parent).not.to.exist;
        expect(reference2.$parent).not.to.exist;
      });


      it('containment', function() {

        // given
        var child1 = model.create('props:ComplexCount');
        var child2 = model.create('props:ComplexNesting');

        // when
        var containedCollection = model.create('props:ContainedCollection', {
          children: [ child1, child2 ]
        });

        // then
        expect(containedCollection.children).to.jsonEqual([ child1, child2 ]);

        expect(child1.$parent).to.equal(containedCollection);
        expect(child2.$parent).to.equal(containedCollection);
      });

    });


    describe('should provide default values', function() {

      it('local', function() {

        // given
        var Attributes = model.getType('props:Attributes');

        // when
        var instance = new Attributes();

        // then
        expect(instance.defaultBooleanValue).to.equal(true);
      });


      it('inherited', function() {

        // given
        var SubAttributes = model.getType('props:SubAttributes');

        // when
        var instance = new SubAttributes();

        // then
        expect(instance.defaultBooleanValue).to.equal(true);
      });

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


      it('should reject empty string as property name', function() {

        // given
        var instance = model.create('props:Attributes');

        // when
        var set = function() {
          instance.set('', 'foo');
        };

        // then
        expect(set).to.throw(TypeError, 'property name must be a non-empty string');
      });


      describe('parent', function() {

        describe('create', function() {

          it('should set parent of contained element', function() {

            // given
            var embeddedComplex = model.create('props:Complex');

            // when
            var embedding = model.create('props:Embedding', {
              embeddedComplex
            });

            // then
            expect(embeddedComplex.$parent).to.equal(embedding);
          });


          it('should set parent of contained elements', function() {

            // given
            var nested = [
              model.create('props:Complex'),
              model.create('props:Complex')
            ];

            // when
            var complexNesting = model.create('props:ComplexNesting', {
              nested
            });

            // then
            nested.forEach(function(element) {
              expect(element.$parent).to.equal(complexNesting);
            });
          });


          it('should not set parent of referenced element', function() {

            // given
            var referencedComplex = model.create('props:Complex');

            // when
            model.create('props:ReferencingSingle', {
              referencedComplex
            });

            // then
            expect(referencedComplex.$parent).not.to.exist;
          });

        });


        describe('set', function() {

          describe('single', function() {

            it('should set parent', function() {

              // given
              var embedding = model.create('props:Embedding'),
                  embeddedComplex = model.create('props:Complex');

              // when
              embedding.set('embeddedComplex', embeddedComplex);

              // then
              expect(embeddedComplex.$parent).to.equal(embedding);
            });


            it('should update parent of element contained elsewhere', function() {

              // given
              var embeddedComplex = model.create('props:Complex');

              model.create('props:Embedding', { embeddedComplex });

              var otherEmbedding = model.create('props:Embedding');

              // when
              otherEmbedding.set('embeddedComplex', embeddedComplex);

              // then
              expect(embeddedComplex.$parent).to.equal(otherEmbedding);
            });


            it('should unset parent of replaced element', function() {

              // given
              var embeddedComplex = model.create('props:Complex');

              var embedding = model.create('props:Embedding', { embeddedComplex });

              // when
              embedding.set('embeddedComplex', model.create('props:Complex'));

              // then
              expect(embeddedComplex.$parent).not.to.exist;
            });


            it('should unset parent of removed element', function() {

              // given
              var embeddedComplex = model.create('props:Complex');

              var embedding = model.create('props:Embedding', { embeddedComplex });

              // when
              embedding.set('embeddedComplex', undefined);

              // then
              expect(embeddedComplex.$parent).not.to.exist;
            });


            it('should keep parent of removed element contained elsewhere', function() {

              // given
              var embeddedComplex = model.create('props:Complex');

              var embedding = model.create('props:Embedding', { embeddedComplex });

              var otherEmbedding = model.create('props:Embedding', { embeddedComplex });

              // when
              embedding.set('embeddedComplex', undefined);

              // then
              expect(embeddedComplex.$parent).to.equal(otherEmbedding);
            });


            it('should keep parent of element moved within target', function() {

              // given
              var embedded = model.create('props:Complex');

              var containers = model.create('props:Containers', { embedded });

              containers.set('otherEmbedded', embedded);

              // when
              containers.set('embedded', undefined);

              // then
              expect(embedded.$parent).to.equal(containers);
            });


            it('should keep parents of swapped elements', function() {

              // given
              var embedded = model.create('props:Complex'),
                  otherEmbedded = model.create('props:Complex');

              var containers = model.create('props:Containers', { embedded, otherEmbedded });

              containers.set('embedded', otherEmbedded);

              // when
              containers.set('otherEmbedded', embedded);

              // then
              expect(embedded.$parent).to.equal(containers);
              expect(otherEmbedded.$parent).to.equal(containers);
            });


            it('should unset parent of element replaced with null', function() {

              // given
              var embeddedComplex = model.create('props:Complex');

              var embedding = model.create('props:Embedding', { embeddedComplex });

              // when
              embedding.set('embeddedComplex', null);

              // then
              expect(embeddedComplex.$parent).not.to.exist;
            });


            it('should set parent of generic element', function() {

              // given
              var embedding = model.create('props:Embedding'),
                  anyElement = model.createAny('other:Foo', 'http://other');

              // when
              embedding.set('embeddedComplex', anyElement);

              // then
              expect(anyElement.$parent).to.equal(embedding);
            });


            it('should ignore non-model element', function() {

              // given
              var embedding = model.create('props:Embedding'),
                  value = {};

              // when
              embedding.set('embeddedComplex', value);

              // then
              expect(value.$parent).not.to.exist;
            });


            it('should ignore removed non-model element', function() {

              // given
              var value = { $parent: 'foo' };

              var embedding = model.create('props:Embedding', { embeddedComplex: value });

              // when
              embedding.set('embeddedComplex', undefined);

              // then
              expect(value.$parent).to.equal('foo');
            });


            it('should not set parent of referenced element', function() {

              // given
              var referencingSingle = model.create('props:ReferencingSingle'),
                  referencedComplex = model.create('props:Complex');

              // when
              referencingSingle.set('referencedComplex', referencedComplex);

              // then
              expect(referencedComplex.$parent).not.to.exist;
            });


            it('should not unset parent of replaced referenced element', function() {

              // given
              var referencedComplex = model.create('props:Complex');

              var embedding = model.create('props:Embedding', {
                embeddedComplex: referencedComplex
              });

              var referencingSingle = model.create('props:ReferencingSingle', {
                referencedComplex
              });

              // when
              referencingSingle.set('referencedComplex', model.create('props:Complex'));

              // then
              expect(referencedComplex.$parent).to.equal(embedding);
            });


            it('should not unset parent of removed referenced element', function() {

              // given
              var referencedComplex = model.create('props:Complex');

              var embedding = model.create('props:Embedding', {
                embeddedComplex: referencedComplex
              });

              var referencingSingle = model.create('props:ReferencingSingle', {
                referencedComplex
              });

              // when
              referencingSingle.set('referencedComplex', undefined);

              // then
              expect(referencedComplex.$parent).to.equal(embedding);
            });

          });


          describe('many', function() {

            it('should set parents', function() {

              // given
              var containedCollection = model.create('props:ContainedCollection');

              var children = [
                model.create('props:Complex'),
                model.create('props:Complex')
              ];

              // when
              containedCollection.set('children', children);

              // then
              children.forEach(function(child) {
                expect(child.$parent).to.equal(containedCollection);
              });
            });


            it('should keep parent of retained element', function() {

              // given
              var fooChild = model.create('props:Complex'),
                  barChild = model.create('props:Complex');

              var containedCollection = model.create('props:ContainedCollection', {
                children: [ fooChild, barChild ]
              });

              // when
              containedCollection.set('children', [ fooChild ]);

              // then
              expect(fooChild.$parent).to.equal(containedCollection);
            });


            it('should unset parent of removed element', function() {

              // given
              var fooChild = model.create('props:Complex'),
                  barChild = model.create('props:Complex');

              var containedCollection = model.create('props:ContainedCollection', {
                children: [ fooChild, barChild ]
              });

              // when
              containedCollection.set('children', [ fooChild ]);

              // then
              expect(barChild.$parent).not.to.exist;
            });


            it('should keep parent of removed element contained elsewhere', function() {

              // given
              var child = model.create('props:Complex');

              var containedCollection = model.create('props:ContainedCollection', {
                children: [ child ]
              });

              var otherCollection = model.create('props:ContainedCollection', {
                children: [ child ]
              });

              // when
              containedCollection.set('children', []);

              // then
              expect(child.$parent).to.equal(otherCollection);
            });


            it('should keep parent of element moved within target', function() {

              // given
              var child = model.create('props:Complex');

              var containers = model.create('props:Containers', {
                children: [ child ]
              });

              containers.set('embedded', child);

              // when
              containers.set('children', []);

              // then
              expect(child.$parent).to.equal(containers);
            });


            it('should set parents of generic elements', function() {

              // given
              var containers = model.create('props:Containers');

              var children = [
                model.createAny('other:Foo', 'http://other'),
                model.createAny('other:Bar', 'http://other')
              ];

              // when
              containers.set('children', children);

              // then
              children.forEach(function(child) {
                expect(child.$parent).to.equal(containers);
              });
            });


            it('should ignore non-model elements', function() {

              // given
              var containedCollection = model.create('props:ContainedCollection'),
                  values = [ {}, {} ];

              // when
              containedCollection.set('children', values);

              // then
              values.forEach(function(value) {
                expect(value.$parent).not.to.exist;
              });
            });


            it('should not set parent of referenced elements', function() {

              // given
              var referencingCollection = model.create('props:ReferencingCollection'),
                  referencedComplex = model.create('props:Complex');

              // when
              referencingCollection.set('references', [ referencedComplex ]);

              // then
              expect(referencedComplex.$parent).not.to.exist;
            });


            it('should not unset parent of removed referenced elements', function() {

              // given
              var referencedComplex = model.create('props:Complex');

              var containedCollection = model.create('props:ContainedCollection', {
                children: [ referencedComplex ]
              });

              var referencingCollection = model.create('props:ReferencingCollection', {
                references: [ referencedComplex ]
              });

              // when
              referencingCollection.set('references', undefined);

              // then
              expect(referencedComplex.$parent).to.equal(containedCollection);
            });


            it('should not unset parent of removed referenced element contained by target', function() {

              // given
              var child = model.create('props:Complex');

              var containers = model.create('props:Containers', {
                children: [ child ],
                references: [ child ]
              });

              // when
              containers.set('references', []);

              // then
              expect(child.$parent).to.equal(containers);
            });

          });


          describe('Element type', function() {

            it('should set parent on create', function() {

              // given
              var generic = model.create('props:Complex'),
                  genericChild = model.createAny('other:Foo', 'http://other');

              // when
              var containers = model.create('props:Containers', {
                generic,
                genericChildren: [ genericChild ]
              });

              // then
              expect(generic.$parent).to.equal(containers);
              expect(genericChild.$parent).to.equal(containers);
            });


            it('should set parent', function() {

              // given
              var containers = model.create('props:Containers'),
                  generic = model.createAny('other:Foo', 'http://other');

              // when
              containers.set('generic', generic);

              // then
              expect(generic.$parent).to.equal(containers);
            });


            it('should unset parent of removed element', function() {

              // given
              var generic = model.createAny('other:Foo', 'http://other');

              var containers = model.create('props:Containers', { generic });

              // when
              containers.set('generic', undefined);

              // then
              expect(generic.$parent).not.to.exist;
            });


            it('should set parents', function() {

              // given
              var containers = model.create('props:Containers');

              var genericChildren = [
                model.create('props:Complex'),
                model.createAny('other:Foo', 'http://other')
              ];

              // when
              containers.set('genericChildren', genericChildren);

              // then
              genericChildren.forEach(function(child) {
                expect(child.$parent).to.equal(containers);
              });
            });


            it('should unset parent of removed elements', function() {

              // given
              var child = model.createAny('other:Foo', 'http://other'),
                  otherChild = model.createAny('other:Bar', 'http://other');

              var containers = model.create('props:Containers', {
                genericChildren: [ child, otherChild ]
              });

              // when
              containers.set('genericChildren', [ otherChild ]);

              // then
              expect(child.$parent).not.to.exist;
              expect(otherChild.$parent).to.equal(containers);
            });


            it('should keep parent of element moved into Element property', function() {

              // given
              var embedded = model.create('props:Complex');

              var containers = model.create('props:Containers', { embedded });

              containers.set('generic', embedded);

              // when
              containers.set('embedded', undefined);

              // then
              expect(embedded.$parent).to.equal(containers);
            });


            it('should keep parent of element moved out of Element property', function() {

              // given
              var child = model.create('props:Complex');

              var containers = model.create('props:Containers', {
                genericChildren: [ child ]
              });

              containers.set('children', [ child ]);

              // when
              containers.set('genericChildren', []);

              // then
              expect(child.$parent).to.equal(containers);
            });

          });

        });

      });

      forEach([
        false,
        true,
        undefined,
        null,
        NaN,
        Function,
        0,
        1,
        Infinity
      ], function(invalidName) {

        it('should reject non-string property name <' + invalidName + '>', function() {

          // given
          var instance = model.create('props:Attributes');

          // when
          var set = function() {
            instance.set(invalidName, 'foo');
          };

          // then
          expect(set).to.throw(TypeError, 'property name must be a non-empty string');
        });

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


      it('access via #get', function() {

        // given
        var BaseWithNumericId = model.getType('props:BaseWithNumericId');

        // when
        var instance = new BaseWithNumericId({ 'id': 1000 });

        // then
        expect(instance.get('props:idNumeric')).to.equal(1000);
      });


      it('access via #get + original name', function() {

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

    });

  });


  describe('integration', function() {

    var proxyConfig = {
      get(target, property) {
        return new Proxy(target[property], proxyConfig);
      }
    };

    it('should support proxies', function() {
      var Complex = model.getType('props:Complex');

      // when
      var proxy = new Proxy(Complex, proxyConfig);

      // then
      expect(proxy.$descriptor).to.exist;
    });

  });

});
