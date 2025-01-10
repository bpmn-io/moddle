import { Moddle } from './index.js';
import { PackageDef } from './moddle.js';
import { ModdleElement } from './factory.js';
import { expectType } from 'ts-expect';
import { EffectiveDescriptor, RegisteredPackage } from './registry.js';

const packages: PackageDef[] = [
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


const moddle = new Moddle(packages, { strict: true });


// work with registered type elements
const AttributeType = moddle.getType<{ key: string, value: string }>('exmpl:Attribute');

const attribute = AttributeType.$model.create(AttributeType.$descriptor, { key: 'guid', value: '44e3-4a40-a0a0' });

type RootModdelType = { location: string, attributes: ModdleElement<{ attribute: [] }> };

const root = moddle.create<RootModdelType>('exmpl:Root');

root.get('code');

const attrs = moddle.create<{ attribute: ModdleElement[] }>('exmpl:Attributes', { attribute: [ attribute ] });

attrs.$parent = root;

root.set('attributes', [ attrs ]);

attribute.$parent = attrs;

if (attrs.$type === undefined || attribute.$attrs.value === undefined) {
  // nothing
}

if (attrs.hasType('unknown:Type') || attrs.$instanceOf(root, 'exmpl:Attributes')) {
  // nothing
} else if (attrs.hasType(AttributeType, 'unknown:type')) {
  // good, but nothing
} else if (attrs.hasType(root, 'foo:bar') || moddle.hasType(root, 'foo:bar')) {
  // mmm..... nothing
}


// work with any type element
const anyModdelElement = moddle.createAny(
    'anyElement1',
    'http://localhost/anyElement1',
    { foo: '', bar: 17, baz: {} as ModdleElement },
);

root.set('anyElements', [anyModdelElement]);

anyModdelElement.$parent = root;

anyModdelElement.get('bar');

anyModdelElement.set('baz', undefined);

const fooVal = anyModdelElement.foo;
expectType<string>(fooVal);

const barVal = anyModdelElement.bar;
expectType<number>(barVal);

const bazVal = anyModdelElement.baz;
expectType<ModdleElement>(bazVal);

const anyElementType = anyModdelElement.$type;
expectType<string>(anyElementType);

anyModdelElement.$instanceOf('anyElement2');

anyModdelElement.$parent = moddle.createAny('anyElement2', 'http://localhost/anyElement2');


const effectiveDescriptor1 = moddle.getElementDescriptor(AttributeType);
expectType<EffectiveDescriptor>(effectiveDescriptor1);

const effectiveDescriptor2 = moddle.getElementDescriptor(root);
expectType<EffectiveDescriptor>(effectiveDescriptor2);


const registeredPackage = moddle.getPackage("exmpl");
expectType<RegisteredPackage>(registeredPackage);

const registeredPackages = moddle.getPackages();
expectType<string>(registeredPackages[0].types[0].ns.name);


const attrsPropDesc = moddle.getPropertyDescriptor(attrs, "attribute");
if (attrsPropDesc.isMany === true) {
  // good
}

const attrPropDesc = moddle.getPropertyDescriptor(AttributeType, 'key');
attrPropDesc.isAttr ? void 0 : void 0;


const typeDef = moddle.getTypeDescriptor('exmpl:Root');

if (typeDef.superClass[1] === 'BaseElement') {
  // it's OK
}





