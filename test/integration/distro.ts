import {
  Moddle,
  PackageDefinition
} from 'moddle';

import { expectType } from 'ts-expect';


const packages: PackageDefinition[] = [
  {
    $schema: 'http://localhost/example/scheme',
    uri: 'http://localhost/example',
    name: 'Example',
    prefix: 'exmpl',
    xml: {
      tagAlias: 'lowerCase',
    },
    types: [
      {
        name: 'Base',
        isAbstract: true,
        meta: {
          description: 'this is base element for all',
        },
      },
      {
        name: 'Root',
        superClass: [ 'Base' ],
        customAttribute: 'useless attribute',
        properties: [
          {
            name: 'code',
            type: 'String',
            isAttr: true,
          },
          {
            name: 'attributes',
            type: 'Attributes',
          },
          {
            name: 'anyElements',
            type: 'Element',
            isMany: true,
          },
        ],
      },
      {
        name: 'Attributes',
        superClass: [ 'Base' ],
        properties: [
          {
            name: 'attribute',
            type: 'exmpl:Attribute',
            isMany: true,
          },
        ],
      },
      {
        name: 'Attribute',
        superClass: [ 'Base' ],
        properties: [
          {
            name: 'key',
            type: 'String',
            isAttr: true,
          },
          {
            name: 'value',
            type: 'String',
            isAttr: true,
          },
        ],
      },
    ],
  },
];

type ExamplAttribute = {
  key: string;
  value: string;
};

type ExamplAttributes = {
  attribute: ExamplAttribute[]
};


describe('integration', function() {

  describe('distro', function() {

    it('should expose typed bundle', function() {

      // when
      const moddle = new Moddle(packages, { strict: true });

      const attrs = moddle.create<ExamplAttributes>('exampl:Attributes');
      expectType<ExamplAttribute[]>(attrs.attribute);
      expectType<ExamplAttribute[]>(attrs.get('attribute'));

      const attr = moddle.create<ExamplAttribute>('exampl:Attribute', { key: 'foo', value: 'bar' });


      expectType<string>(attr.key);
      expectType<string>(attrs.get('key'));

      expectType<unknown>(attrs.get('$parent'));
      expectType<unknown>(attrs.get('$attrs'));

      attrs.get('attribute').push(attr);

    });

  });

});