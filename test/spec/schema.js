import Ajv from 'ajv';
import FastGlob from 'fast-glob';

import { readFile } from '../helper.js';
import expect from '../expect.js';


describe('JSON schema', () => {

  let validator;

  before(() => {
    const schema = readFile('docs/moddle.json');

    validator = new Ajv().compile(JSON.parse(schema));
  });


  for (const file of FastGlob.globSync('test/fixtures/model/**/*.json')) {

    it(`should validate fixture: ${file}`, () => {

      // given
      const model = JSON.parse(readFile(file));

      // then
      expect(validator(model)).to.be.true;
    });
  }
});
