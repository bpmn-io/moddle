import expect from '../expect.js';

import {
  createModelBuilder
} from '../helper.js';

import { Moddle } from 'moddle';


describe('meta', function() {

  var createModel = createModelBuilder('test/fixtures/model/');
  var model = createModel([ 'meta' ]);


  it('should have the "meta" attribute', function() {

    // when
    var meta = model.getTypeDescriptor('c:Car').meta;

    // then
    expect(meta).to.exist;
    expect(meta).to.be.an('object');
  });


  it('should have a "owners" property inside "meta"', function() {

    // when
    var meta = model.getTypeDescriptor('c:Car').meta;

    // then
    expect(meta.owners).to.exist;
    expect(meta.owners).to.eql([ 'the pope', 'donald trump' ]);
  });


  it('should copy "meta" from type definition', function() {

    // given
    var typeMeta = { owners: [ 'the pope' ] };

    var pkg = {
      name: 'Cars',
      uri: 'http://cars',
      prefix: 'c',
      types: [
        { name: 'Car', meta: typeMeta }
      ]
    };

    // when
    var registeredModel = new Moddle([ pkg ]);

    // then
    var meta = registeredModel.getTypeDescriptor('c:Car').meta;

    expect(meta).to.eql(typeMeta);
    expect(meta).not.to.equal(typeMeta);
  });

});
