import expect from '../expect.js';

import {
  createModelBuilder,
  expectOrderedProperties,
  getEffectiveDescriptor
} from '../helper.js';


describe('extension', function() {

  var createModel = createModelBuilder('test/fixtures/model/');


  describe('trait', function() {

    it('should not provide meta-data', function() {

      // given
      var model = createModel([ 'extension/base', 'extension/custom' ]);

      // then
      expect(() => {
        model.getType('c:CustomRoot');
      }).to.throw(/cannot create <c:CustomRoot> extending <b:Root>/);
    });

  });


  describe('types', function() {

    describe('built-in shadowing', function() {

      // given
      var model = createModel([ 'shadow' ]);


      it('should shadow <Element>', function() {

        // when
        var element = model.create('s:Element');

        // then
        expect(element).to.exist;
        expect(element.$instanceOf('s:Element')).to.be.true;
      });


      it('should shadow <Element> in inheritance hierarchy', function() {

        // when
        var element = model.create('s:NamedElement');

        // then
        expect(element).to.exist;
        expect(element.$instanceOf('s:Element')).to.be.true;
        expect(element.$instanceOf('s:NamedElement')).to.be.true;
      });


      it('should provide <Element> built-in type', function() {

        // when
        var element = model.create('s:ExtendsBuiltinElement');

        // then
        expect(element).to.exist;
        expect(element.$instanceOf('Element')).to.be.true;
        expect(element.$instanceOf('s:ExtendsBuiltinElement')).to.be.true;
      });

    });


    describe('extending', function() {

      var model = createModel([ 'extension/base', 'extension/custom' ]);


      describe('basics', function() {

        it('should plug-in into type hierarchy', function() {

          var root = model.create('b:Root');

          // then
          expect(root.$instanceOf('c:CustomRoot')).to.be.true;
        });

      });


      describe('properties', function() {

        it('should register', function() {

          // when
          var descriptor = getEffectiveDescriptor(model, 'b:Root');

          // then
          // local properties remain
          expect(descriptor.propertiesByName).to.have.property('ownAttr');

          // extension properties are not local
          expect(descriptor.propertiesByName).not.to.have.property('customAttr');
          expect(descriptor.propertiesByName).not.to.have.property('customBaseAttr');

          // but registered as extension properties
          expect(descriptor.propertiesByName).to.have.property('c:customAttr');
          expect(descriptor.propertiesByName).to.have.property('c:customBaseAttr');
        });


        it('should refine', function() {

          // when
          var descriptor = getEffectiveDescriptor(model, 'b:Root');

          var genericProperty = descriptor.propertiesByName['c:generic'];

          // then
          expect(genericProperty).to.exist;
          expect(genericProperty.name).to.eql('c:generic');
          expect(genericProperty.type).to.eql('c:CustomGeneric');

          // and refined original, too
          expect(descriptor.propertiesByName).to.have.property('generic', genericProperty);
        });


        it('should replace', function() {

          // when
          var descriptor = getEffectiveDescriptor(model, 'b:Root');

          var idProperty = descriptor.propertiesByName['c:id'];

          // then
          expect(idProperty).to.exist;
          expect(idProperty.name).to.eql('c:id');

          // and replaced original, too
          expect(descriptor.propertiesByName).to.have.property('id', idProperty);
        });


        it('should indicate extended', function() {

          // when
          var descriptor = getEffectiveDescriptor(model, 'b:Root');

          var propertiesByName = descriptor.propertiesByName;

          // assume
          expect(propertiesByName).to.include.keys([
            'c:customAttr',
            'c:customBaseAttr',
            'ownAttr'
          ]);

          // then
          expect(propertiesByName['c:customAttr']).to.have.property('inherited', false);
          expect(propertiesByName['c:customBaseAttr']).to.have.property('inherited', false);
          expect(propertiesByName['ownAttr']).to.have.property('inherited', true);
        });


        it('should handle conflicting names', function() {

          // when
          var descriptor = getEffectiveDescriptor(model, 'b:Root');

          // then
          expect(descriptor.propertiesByName).to.include.keys([
            'own',
            'c:own'
          ]);
        });

      });


      describe('types', function() {

        it('should provide custom', function() {

          var property = model.create('c:Property');

          // then
          expect(property.$instanceOf('c:Property')).to.be.true;
        });

      });


      describe('generics', function() {

        it('should extend Element', function() {

          // when
          var customGeneric = model.create('c:CustomGeneric', { count: 100 });

          // then
          expect(customGeneric.$instanceOf('Element')).to.be.true;
        });


        it('should be part of generic collection', function() {

          var customProperty = model.create('c:Property', { key: 'foo', value: 'bar' });

          // when
          var root = model.create('b:Root', {
            genericCollection: [ customProperty ]
          });

          // then
          expect(root.genericCollection).to.eql([ customProperty ]);
          expect(root.get('b:genericCollection')).to.eql([ customProperty ]);
        });

      });

    });


    describe('name clashes', function() {

      var model = createModel([
        'multiple-inheritance/base',
        'multiple-inheritance/other',
        'multiple-inheritance/glue'
      ]);


      it('should handle multiple inheritance through virtual package', function() {

        var baseElement = model.create('b:Element');

        var otherElement = model.create('o:DiagramElement');

        var diagram = model.create('o:Diagram', {
          'b:ownedElement': [ baseElement ],
          ownedElement: [ otherElement ]
        });

        // then
        expect(diagram.$instanceOf('b:Element')).to.be.true;
        expect(diagram.$instanceOf('o:DiagramElement')).to.be.true;
      });

    });

  });


  describe('properties', function() {

    describe('<replaces>', function() {

      describe('same package', function() {

        var model = createModel([ 'replaces/base' ]);


        it('should modify descriptor', function() {

          // when
          var descriptor = getEffectiveDescriptor(model, 'b:Extension');

          // then
          expectOrderedProperties(descriptor, [
            'name',
            'value',
            'id'
          ]);

          const idProperty = descriptor.propertiesByName['id'];

          expect(idProperty).to.exist;
          expect(descriptor.propertiesByName).to.have.property('b:id', idProperty);
        });


        it('should instantiate', function() {

          // when
          var extension = model.create('b:Extension', {
            id: 10
          });

          // then
          expect(extension.id).to.eql(10);

          // unavailable via namespaced name
          expect(extension['b:id']).not.to.exist;

          expect(extension.get('id')).to.eql(10);
          expect(extension.get('b:id')).to.eql(10);
        });


        it('should instantiate (ns property)', function() {

          // when
          var extension = model.create('b:Extension', {
            'b:id': 10
          });

          // then
          expect(extension.id).to.eql(10);

          // unavailable via namespaced name
          expect(extension['b:id']).not.to.exist;

          expect(extension.get('id')).to.eql(10);
          expect(extension.get('b:id')).to.eql(10);
        });


        it('should set', function() {

          // given
          var extension = model.create('b:Extension');

          // when
          extension.set('id', 10);

          // then
          expect(extension.id).to.eql(10);

          // unavailable via namespaced name
          expect(extension['b:id']).not.to.exist;

          expect(extension.get('id')).to.eql(10);
          expect(extension.get('b:id')).to.eql(10);
        });


        it('should set (ns property)', function() {

          // given
          var extension = model.create('b:Extension');

          // when
          extension.set('b:id', 10);

          // then
          expect(extension.id).to.eql(10);

          // unavailable via namespaced name
          expect(extension['b:id']).not.to.exist;

          expect(extension.get('id')).to.eql(10);
          expect(extension.get('b:id')).to.eql(10);
        });

      });


      describe('other package <superClass>', function() {

        var model = createModel([
          'replaces/base',
          'replaces/extension'
        ]);


        it('should modify descriptor', function() {

          // when
          var descriptor = getEffectiveDescriptor(model, 'e:Base');

          // then
          expectOrderedProperties(descriptor, [
            'name',
            'value',
            'id'
          ]);

          const idProperty = descriptor.propertiesByName['id'];

          expect(idProperty).to.exist;
          expect(descriptor.propertiesByName).to.have.property('b:id', idProperty);
          expect(descriptor.propertiesByName).to.have.property('e:id', idProperty);
        });


        it('should instantiate', function() {

          // when
          var extension = model.create('e:Base', {
            id: 10
          });

          // then
          expect(extension.id).to.eql(10);

          // unavailable via namespaced name
          expect(extension['b:id']).not.to.exist;

          expect(extension.get('id')).to.eql(10);
          expect(extension.get('b:id')).to.eql(10);
          expect(extension.get('e:id')).to.eql(10);
        });


        it('should instantiate (ns property)', function() {

          // when
          var extension = model.create('e:Base', {
            'e:id': 10
          });

          // then
          expect(extension.id).to.eql(10);

          // unavailable via namespaced name
          expect(extension['b:id']).not.to.exist;

          expect(extension.get('id')).to.eql(10);
          expect(extension.get('b:id')).to.eql(10);
          expect(extension.get('e:id')).to.eql(10);
        });


        it('should set', function() {

          // given
          var extension = model.create('e:Base');

          // when
          extension.set('id', 10);

          // then
          expect(extension.id).to.eql(10);

          // unavailable via namespaced name
          expect(extension['b:id']).not.to.exist;

          expect(extension.get('id')).to.eql(10);
          expect(extension.get('b:id')).to.eql(10);
          expect(extension.get('e:id')).to.eql(10);
        });


        it('should set (ns property)', function() {

          // given
          var extension = model.create('e:Base');

          // when
          extension.set('e:id', 10);

          // then
          expect(extension.id).to.eql(10);

          // unavailable via namespaced name
          expect(extension['b:id']).not.to.exist;

          expect(extension.get('id')).to.eql(10);
          expect(extension.get('b:id')).to.eql(10);
          expect(extension.get('e:id')).to.eql(10);
        });

      });


      describe('other package <extends>', function() {

        var model = createModel([
          'replaces/base',
          'replaces/custom'
        ]);


        it('should modify descriptor', function() {

          // when
          var descriptor = getEffectiveDescriptor(model, 'b:Base');

          // then
          expectOrderedProperties(descriptor, [
            'name',
            'c:value',
            'c:id'
          ]);

          const idProperty = descriptor.propertiesByName['id'];

          expect(idProperty).to.exist;
          expect(descriptor.propertiesByName).to.have.property('b:id', idProperty);
          expect(descriptor.propertiesByName).to.have.property('c:id', idProperty);
        });


        it('should instantiate', function() {

          // when
          var extension = model.create('b:Base', {
            id: 10
          });

          // then
          expect(extension['c:id']).to.eql(10);

          // unavailable via local name
          expect(extension.id).not.to.exist;

          expect(extension.get('id')).to.eql(10);
          expect(extension.get('b:id')).to.eql(10);
          expect(extension.get('c:id')).to.eql(10);
        });


        it('should instantiate (ns property)', function() {

          // when
          var extension = model.create('b:Base', {
            'c:id': 10
          });

          // then
          expect(extension['c:id']).to.eql(10);

          // unavailable via local name
          expect(extension.id).not.to.exist;

          expect(extension.get('id')).to.eql(10);
          expect(extension.get('b:id')).to.eql(10);
          expect(extension.get('c:id')).to.eql(10);
        });


        it('should set', function() {

          // given
          var extension = model.create('b:Base');

          // when
          extension.set('id', 10);

          // then
          expect(extension['c:id']).to.eql(10);

          // unavailable via local name
          expect(extension.id).not.to.exist;

          expect(extension.get('id')).to.eql(10);
          expect(extension.get('b:id')).to.eql(10);
          expect(extension.get('c:id')).to.eql(10);
        });


        it('should set (ns property)', function() {

          // given
          var extension = model.create('b:Base');

          // when
          extension.set('id', 10);

          // then
          expect(extension['c:id']).to.eql(10);

          // unavailable via local name
          expect(extension.id).not.to.exist;

          expect(extension.get('id')).to.eql(10);
          expect(extension.get('b:id')).to.eql(10);
          expect(extension.get('c:id')).to.eql(10);
        });

      });

    });


    describe('<redefines>', function() {

      describe('same package', function() {

        var model = createModel([ 'redefines/base' ]);


        it('should modify descriptor', function() {

          // when
          var descriptor = getEffectiveDescriptor(model, 'b:Extension');

          // then
          expectOrderedProperties(descriptor, [
            'id',
            'name',
            'value'
          ]);

          const idProperty = descriptor.propertiesByName['id'];

          expect(idProperty).to.exist;
          expect(descriptor.propertiesByName).to.have.property('b:id', idProperty);
        });


        it('should instantiate', function() {

          // when
          var extension = model.create('b:Extension', {
            id: 10
          });

          // then
          expect(extension.id).to.eql(10);

          // unavailable via namespaced name
          expect(extension['b:id']).not.to.exist;

          expect(extension.get('id')).to.eql(10);
          expect(extension.get('b:id')).to.eql(10);
        });


        it('should instantiate (ns property)', function() {

          // when
          var extension = model.create('b:Extension', {
            'b:id': 10
          });

          // then
          expect(extension.id).to.eql(10);

          // unavailable via namespaced name
          expect(extension['b:id']).not.to.exist;

          expect(extension.get('id')).to.eql(10);
          expect(extension.get('b:id')).to.eql(10);
        });


        it('should set', function() {

          // given
          var extension = model.create('b:Extension');

          // when
          extension.set('id', 10);

          // then
          expect(extension.id).to.eql(10);

          // unavailable via namespaced name
          expect(extension['b:id']).not.to.exist;

          expect(extension.get('id')).to.eql(10);
          expect(extension.get('b:id')).to.eql(10);
        });


        it('should set (ns property)', function() {

          // given
          var extension = model.create('b:Extension');

          // when
          extension.set('b:id', 10);

          // then
          expect(extension.id).to.eql(10);

          // unavailable via namespaced name
          expect(extension['b:id']).not.to.exist;

          expect(extension.get('id')).to.eql(10);
          expect(extension.get('b:id')).to.eql(10);
        });

      });


      describe('other package <superClass>', function() {

        var model = createModel([
          'redefines/base',
          'redefines/extension'
        ]);


        it('should modify descriptor', function() {

          // when
          var descriptor = getEffectiveDescriptor(model, 'e:Base');

          // then
          expectOrderedProperties(descriptor, [
            'id',
            'name',
            'value'
          ]);

          const idProperty = descriptor.propertiesByName['id'];

          expect(idProperty).to.exist;
          expect(descriptor.propertiesByName).to.have.property('b:id', idProperty);
          expect(descriptor.propertiesByName).to.have.property('e:id', idProperty);
        });


        it('should instantiate', function() {

          // when
          var extension = model.create('e:Base', {
            id: 10
          });

          // then
          expect(extension.id).to.eql(10);

          // unavailable via namespaced names
          expect(extension['e:id']).not.to.exist;
          expect(extension['b:id']).not.to.exist;

          expect(extension.get('id')).to.eql(10);
          expect(extension.get('b:id')).to.eql(10);
          expect(extension.get('e:id')).to.eql(10);
        });


        it('should instantiate (ns property)', function() {

          // when
          var extension = model.create('e:Base', {
            'e:id': 10
          });

          // then
          expect(extension.id).to.eql(10);

          // unavailable via namespaced names
          expect(extension['e:id']).not.to.exist;
          expect(extension['b:id']).not.to.exist;

          expect(extension.get('id')).to.eql(10);
          expect(extension.get('b:id')).to.eql(10);
          expect(extension.get('e:id')).to.eql(10);
        });


        it('should set', function() {

          // given
          var extension = model.create('e:Base');

          // when
          extension.set('id', 10);

          // then
          expect(extension.id).to.eql(10);

          // unavailable via namespaced names
          expect(extension['e:id']).not.to.exist;
          expect(extension['b:id']).not.to.exist;

          expect(extension.get('id')).to.eql(10);
          expect(extension.get('b:id')).to.eql(10);
          expect(extension.get('e:id')).to.eql(10);
        });


        it('should set (ns property)', function() {

          // given
          var extension = model.create('e:Base');

          // when
          extension.set('e:id', 10);

          // then
          expect(extension.id).to.eql(10);

          // unavailable via namespaced names
          expect(extension['e:id']).not.to.exist;
          expect(extension['b:id']).not.to.exist;

          expect(extension.get('id')).to.eql(10);
          expect(extension.get('b:id')).to.eql(10);
          expect(extension.get('e:id')).to.eql(10);
        });

      });


      describe('other package <extends>', function() {

        var model = createModel([
          'redefines/base',
          'redefines/custom'
        ]);


        it('should modify descriptor', function() {

          // given
          var Base = model.getType('b:Base');

          // when
          var descriptor = model.getElementDescriptor(Base);
          var propertyNames = descriptor.properties.map(function(p) {
            return p.name;
          });

          // then
          expect(propertyNames).to.eql([
            'c:id',
            'name',
            'c:value'
          ]);

          const idProperty = descriptor.propertiesByName['id'];

          expect(idProperty).to.exist;
          expect(descriptor.propertiesByName).to.have.property('b:id', idProperty);
          expect(descriptor.propertiesByName).to.have.property('c:id', idProperty);
        });


        it('should instantiate', function() {

          // when
          var extension = model.create('b:Base', {
            id: 10
          });

          // then
          expect(extension['c:id']).to.eql(10);

          // unavailable via local name
          expect(extension['id']).not.to.exist;

          expect(extension.get('id')).to.eql(10);
          expect(extension.get('b:id')).to.eql(10);
          expect(extension.get('c:id')).to.eql(10);
        });


        it('should instantiate (ns property)', function() {

          // when
          var extension = model.create('b:Base', {
            'c:id': 10
          });

          // then
          expect(extension['c:id']).to.eql(10);

          // unavailable via local name
          expect(extension['id']).not.to.exist;

          expect(extension.get('id')).to.eql(10);
          expect(extension.get('b:id')).to.eql(10);
          expect(extension.get('c:id')).to.eql(10);
        });


        it('should set', function() {

          // given
          var extension = model.create('b:Base');

          // when
          extension.set('id', 10);

          // then
          expect(extension['c:id']).to.eql(10);

          // unavailable via local name
          expect(extension['id']).not.to.exist;

          expect(extension.get('id')).to.eql(10);
          expect(extension.get('b:id')).to.eql(10);
          expect(extension.get('c:id')).to.eql(10);
        });


        it('should set (ns property)', function() {

          // given
          var extension = model.create('b:Base');

          // when
          extension.set('c:id', 10);

          // then
          expect(extension['c:id']).to.eql(10);

          // unavailable via local name
          expect(extension['id']).not.to.exist;

          expect(extension.get('id')).to.eql(10);
          expect(extension.get('b:id')).to.eql(10);
          expect(extension.get('c:id')).to.eql(10);
        });

      });

    });

  });


  describe('extension - self extend', function() {

    it('should self-extend', async function() {

      // when
      var model = createModel([ 'self-extend' ]);

      var element = model.create('se:Rect');

      // then
      expect(element.$instanceOf('se:ExtendedRect')).to.be.true;
      expect(element.$instanceOf('se:OtherExtendedRect')).to.be.true;
    });
  });
});
