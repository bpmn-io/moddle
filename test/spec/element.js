import expect from '../expect';
import { createModelBuilder } from '../helper';

describe('element', function() {

  var createModel = createModelBuilder('test/fixtures/model/');
  var model = createModel([ 'element' ]);

  it('should provide type descriptor for Element', function() {

    // given
    var elementType = model.getType('e:Element');
    var expectedDescriptor = model.getElementDescriptor(elementType);

    // when
    var descriptor = elementType.$descriptor;

    // then
    expect(descriptor).to.equal(expectedDescriptor);
  });

  it('should provide type descriptor for NamedElement', function() {

    // given
    var namedElementType = model.getType('e:NamedElement');
    var expectedDescriptor = model.getElementDescriptor(namedElementType);

    // when
    var descriptor = namedElementType.$descriptor;

    // then
    expect(descriptor).to.equal(expectedDescriptor);
  });

  it('should create NamedElement instance', function() {

    // when
    var instance = model.create('e:NamedElement');

    // then
    expect(instance).to.exist;
    expect(instance.$instanceOf('e:NamedElement')).to.be.true;
    expect(instance.$instanceOf('e:Element')).to.be.true;
  });

});
