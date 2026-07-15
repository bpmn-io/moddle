import {
  Moddle,
  PackageDefinition,
  ModdleElement,
  ModdleElementType,
  AnyModdleElement
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


    it('should expose element types', function() {

      // given
      const moddle = new Moddle(packages, { strict: true });

      // ModdleElement<T>
      const attr = moddle.create<ExamplAttribute>('exampl:Attribute', { key: 'foo', value: 'bar' });

      expectType<ModdleElement<ExamplAttribute>>(attr);
      expectType<string>(attr.$type);
      expectType<Record<string, any>>(attr.$attrs);
      expectType<ModdleElement | AnyModdleElement | undefined>(attr.$parent);
      expectType<string>(attr.key);

      // ModdleElementType<T>
      const AttributeType = moddle.getType<ExamplAttribute>('exampl:Attribute');

      expectType<ModdleElementType<ExamplAttribute>>(AttributeType);

      const instance = new AttributeType({ key: 'foo', value: 'bar' });

      expectType<ModdleElement<ExamplAttribute>>(instance);
      expectType<string>(instance.key);

      // AnyModdleElement<T>
      const any = moddle.createAny<ExamplAttribute>('vendor:Attribute', 'http://vendor', {
        key: 'foo',
        value: 'bar'
      });

      expectType<AnyModdleElement<ExamplAttribute>>(any);
      expectType<string>(any.$type);
      expectType<string>(any.key);

    });

  });

});