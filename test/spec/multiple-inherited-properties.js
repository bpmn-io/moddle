import expect from '../expect';
import { createModelBuilder } from '../helper';


describe('multiple inherited properties', function() {

  // given

  // Moddle instance with multiple superClasses partly from different
  // namespaces.
  var createModel = createModelBuilder('test/fixtures/model/');
  var mhModel = createModel([
    'properties',
    'multiple-inherited-properties',
    'datatype'
  ]);


  describe('Type', function() {

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

    it('should provide descriptor', function() {

      // given
      var Type = mhModel.getType('mh:MultipleInherited');

      // when
      var getDescriptor = function() {
        mhModel.getElementDescriptor(Type);
      };

      // then
      expect(getDescriptor).to.not.throw();

      var descriptor = mhModel.getElementDescriptor(Type);
      expect(descriptor).to.exist;
    });

    describe('invalid', function() {

      it('should NOT provide Type', function() {

        // when
        var getType = function() {
          mhModel.getType('mh:InvalidMultipleInherited');
        };

        // then
        expect(getType)
          .to.throw('property <defaultSingle> already defined; override of ' +
                    '<mh:AnotherRoot#mh:defaultSingle> by ' +
                    '<mh:InvalidMultipleInherited#mh:defaultSingle> not ' +
                    'allowed without redefines');
      });

    }); // describe(multiple inherited/Type/invalid)

    describe('descriptor', function() {

      // given
      var Type = mhModel.getType('mh:MultipleInherited');
      var descriptor = mhModel.getElementDescriptor(Type);
      var propsByName = descriptor.propertiesByName;

      it('should map properties by name', function() {

        // then
        expect(propsByName.any).to.exist;
        expect(propsByName['mh:any']).to.exist;
        expect(propsByName['props:any']).to.exist;
        expect(propsByName.any).to.eql(propsByName['mh:any']);

        expect(propsByName.many).to.exist;
        expect(propsByName['mh:many']).to.exist;
        expect(propsByName['props:many']).to.exist;
        expect(propsByName.many).to.eql(propsByName['mh:many']);

        expect(propsByName.single).to.exist;
        expect(propsByName['mh:single']).to.exist;
        expect(propsByName['props:single']).to.exist;
        expect(propsByName.single).to.equal(propsByName['mh:single']);

        expect(propsByName.defaultSingle).to.exist;
        expect(propsByName['mh:defaultSingle']).to.exist;
        expect(propsByName['props:defaultSingle']).to.exist;
        expect(propsByName['dt:defaultSingle']).to.exist;
        expect(propsByName.defaultSingle).to
          .equal(propsByName['mh:defaultSingle']);

        expect(propsByName.anotherDefaultSingle).to.exist;
        expect(propsByName['mh:anotherDefaultSingle']).to.exist;
        expect(propsByName['props:anotherDefaultSingle']).to.exist;
        expect(propsByName.anotherDefaultSingle).to
          .equal(propsByName['mh:anotherDefaultSingle']);
      });

      it('should describe defined property type', function() {

        // then
        expect(propsByName.any.type).to.equal('mh:AnotherRoot');

        // Note: no need to test 'mh:any' as we test equality with 'any' in
        // 'should map properties by name'

        expect(propsByName['props:any'].type).to.equal('props:Base');

        expect(propsByName.many.type).to.equal('String');
        expect(propsByName['props:many'].type).to.equal('Integer');

        expect(propsByName.single.type).to.equal('String');
        expect(propsByName['props:single'].type).to.equal('Integer');

        expect(propsByName.defaultSingle.type).to.equal('String');
        expect(propsByName['props:defaultSingle'].type).to.equal('Integer');
        expect(propsByName['dt:defaultSingle'].type).to.equal('Boolean');

        expect(propsByName.anotherDefaultSingle.type).to.equal('Boolean');
        expect(propsByName['props:anotherDefaultSingle'].type).to
          .equal('Integer');
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

        // Note: access to local name ONLY with 'get()'. The local name is NOT
        // mapped into the object!

        var localProperty = instance.get('mh:defaultSingle');
        var otherProperty = instance['props:defaultSingle'];
        var anotherProperty = instance['dt:defaultSingle'];

        it('should exist', function() {

          // then
          expect(originalProperty).to.exist;
          expect(localProperty).to.exist;
          expect(otherProperty).to.exist;
          expect(anotherProperty).to.exist;
        });

        it('should hold different values', function() {

          // then
          expect(originalProperty).to.equal('mh-default-string');
          expect(otherProperty).to.equal(42);
          expect(anotherProperty).to.equal(true);
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

          // Note: access to local name ONLY with 'get()'. The local name is NOT
          // mapped into the object!

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


        it('should access via original name', function() {

          // then
          expect(originalProperty).to.eql([ 'mh-original-string' ]);
          expect(originalProperty).to.eql(localProperty);
        });


        it('should access via local name', function() {

          // then
          expect(localProperty).to.eql([ 'mh-original-string' ]);
          expect(localProperty).to.eql(localProperty);
        });


        it('should access via other name', function() {

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
