const {
  expect
} = require('chai');

const pkg = require('../../package.json');
const pkgExports = pkg.exports['.'];


describe('moddle', function() {

  it('should expose CJS bundle', function() {

    const {
      Moddle,
      isSimpleType,
      isBuiltInType,
      parseNameNS,
      coerceType
    } = require('../../' + pkgExports.require);

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
    } = require('../../' + pkg['umd:main']);

    expect(new Moddle()).to.exist;

    expect(isSimpleType).to.exist;
    expect(isBuiltInType).to.exist;
    expect(parseNameNS).to.exist;
    expect(coerceType).to.exist;
  });

});