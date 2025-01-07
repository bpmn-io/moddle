import DescriptorBuilder, { PropertyDescriptor } from './descriptor-builder.js';
import { Namespace } from './ns.js';
import { RegisteredTypeDef } from './registry.js';
import { expectType } from 'ts-expect';

const ns: Namespace = { name: 'foo:bar',  localName: 'bar', prefix: 'foo' };

const builder = new DescriptorBuilder(ns);

const typeStub = {} as RegisteredTypeDef;
builder.addTrait(typeStub , false);

const descriptor = builder.build();

if (ns === descriptor.ns) {
}

descriptor.allTypes.forEach(t => {
  // do something
  // for example, check the type
  expectType<RegisteredTypeDef>(t);
});

for (const name of Object.keys(descriptor.allTypesByName)) {
  // do something
  // for example, check the type
  expectType<string>(name);

  //when
  const type = descriptor.allTypesByName[name];
  //then
  expectType<RegisteredTypeDef>(type);
}

descriptor.properties.forEach(p => {
  if (p.definedBy?.name === descriptor.name) {
  }

  if (p.inherited) {
  }

  if (p.localName === p.ns.localName) {
  }

  if (p.isMany) {
  }

  expectType<PropertyDescriptor>(p);
});

for (const name of Object.keys(descriptor.propertiesByName)) {
  //when
  const propertyDesc = descriptor.propertiesByName[name];
  //then
  expectType<PropertyDescriptor>(propertyDesc);

  if (propertyDesc == descriptor.bodyProperty) {
  }

  if (propertyDesc == descriptor.idProperty) {
  }
}

