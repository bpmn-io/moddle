const {
  expect
} = require('chai');


describe('integration', function() {

  describe('distro', function() {

    it('should expose CJS bundle', function() {

      const {
        Moddle,
        isSimpleType,
        isBuiltInType,
        parseNameNS,
        coerceType
      } = require('moddle');

      expect(new Moddle()).to.exist;

      expect(isSimpleType).to.exist;
      expect(isBuiltInType).to.exist;
      expect(parseNameNS).to.exist;
      expect(coerceType).to.exist;
    });



    it('should expose ESM bundle', async function() {

      const {
        Moddle,
        isSimpleType,
        isBuiltInType,
        parseNameNS,
        coerceType
      } = await import('moddle');

      expect(new Moddle()).to.exist;

      expect(isSimpleType).to.exist;
      expect(isBuiltInType).to.exist;
      expect(parseNameNS).to.exist;
      expect(coerceType).to.exist;
    });

  });

});