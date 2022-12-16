import expect from '../expect.js';

import {
  createModelBuilder
} from '../helper.js';


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

});
