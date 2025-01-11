import Registry, { RegisteredPackage, RegisteredTypeDef } from './registry.js';
import { PackageDefinition } from './moddle.js';
import Properties from './properties.js';
import { Moddle } from './index.js';
import { expectType } from 'ts-expect';
import { EffectiveDescriptor } from './descriptor-builder.js';

const packagesStub = {} as Record<string, PackageDefinition>;

const registry = new Registry(packagesStub, new Properties({} as Moddle));

//when
const desc = registry.getEffectiveDescriptor('some:element');
//then
expectType<EffectiveDescriptor>(desc);


//when
const fooBarType = registry.typeMap['foo:bar'];
//then
expectType<RegisteredTypeDef>(fooBarType);


//when
const pkg = registry.getPackage('foo');
//then
expectType<RegisteredPackage>(pkg);


//when
const pkgs = registry.getPackages();
//then
expectType<Array<RegisteredPackage>>(pkgs);
