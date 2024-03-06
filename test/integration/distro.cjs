const {
  expect
} = require('chai');

const pkg = require('../../package.json');
const pkgExports = pkg.exports['.'];


describe('integration', function() {

  describe('distro', function() {

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

  });

});