const {
  expect
} = require('chai');


describe('moddle', function() {

  it('should expose CJS bundle', function() {

    const {
      Moddle,
      isSimpleType,
      isBuiltInType,
      parseNameNS,
      coerceType
    } = require('../..');

    expect(new Moddle()).to.exist;

    expect(isSimpleType).to.exist;
    expect(isBuiltInType).to.exist;
    expect(parseNameNS).to.exist;
    expect(coerceType).to.exist;
  });


  it('should expose UMD bundle', function() {
    const {
      Moddle,
      isSimpleType,
      isBuiltInType,
      parseNameNS,
      coerceType
    } = require('../../dist/moddle.umd.prod');

    expect(new Moddle()).to.exist;

    expect(isSimpleType).to.exist;
    expect(isBuiltInType).to.exist;
    expect(parseNameNS).to.exist;
    expect(coerceType).to.exist;
  });

});