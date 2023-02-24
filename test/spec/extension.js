import expect from '../expect.js';

import {
  createModelBuilder
} from '../helper.js';


describe('extension', function() {

  var createModel = createModelBuilder('test/fixtures/model/');


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

  });


  describe('extension', function() {

    var model = createModel([ 'extension/base', 'extension/custom' ]);


    describe('trait', function() {

      it('should not provide meta-data', function() {

        expect(() => {
          model.getType('c:CustomRoot');
        }).to.throw(/cannot create <c:CustomRoot> extending <b:Root>/);
      });


      describe('descriptor', function() {

        it('should indicate non-inherited', function() {

          // given
          var ComplexType = model.getType('b:Root');

          // when
          var descriptor = model.getElementDescriptor(ComplexType),
              customAttrDescriptor = descriptor.propertiesByName['customAttr'],
              customBaseAttrDescriptor = descriptor.propertiesByName['customBaseAttr'],
              ownAttrDescriptor = descriptor.propertiesByName['ownAttr'];

          // then
          expect(customAttrDescriptor.inherited).to.be.false;
          expect(customBaseAttrDescriptor.inherited).to.be.false;
          expect(ownAttrDescriptor.inherited).to.be.true;
        });

      });


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

        var customProperty = model.create('c:Property', { key: 'foo', value: 'bar' });

        // when
        var root = model.create('b:Root', {
          genericCollection: [ customProperty ]
        });

        // then
        expect(root.genericCollection).to.eql([ customProperty ]);
      });

    });

  });


  describe('property replacement', function() {

    var model = createModel([ 'replaces/base' ]);

    it('should replace in descriptor', function() {

      // given
      var Extension = model.getType('b:Extension');

      // when
      var descriptor = model.getElementDescriptor(Extension),
          propertyNames = descriptor.properties.map(function(p) {
            return p.name;
          });

      // then
      expect(propertyNames).to.eql([
        'name',
        'value',
        'id'
      ]);

      expect(descriptor.propertiesByName['b:id'].type).to.eql('Integer');
      expect(descriptor.propertiesByName['id'].type).to.eql('Integer');
    });

  });


  describe('property redefinition', function() {

    var model = createModel([ 'redefines/base' ]);

    it('should redefine in descriptor', function() {

      // given
      var Extension = model.getType('b:Extension');

      // when
      var descriptor = model.getElementDescriptor(Extension),
          propertyNames = descriptor.properties.map(function(p) {
            return p.name;
          });

      // then
      expect(propertyNames).to.eql([
        'id',
        'name',
        'value'
      ]);

      expect(descriptor.propertiesByName['b:id'].type).to.eql('Integer');
      expect(descriptor.propertiesByName['id'].type).to.eql('Integer');
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
