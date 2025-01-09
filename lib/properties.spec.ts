import { expectType } from 'ts-expect';

import Properties from './properties.js';
import { Moddle } from './index.js';
import { ModdleElement } from './factory.js';
import { EffectiveDescriptor } from './registry.js';
import { AnyTypeDescriptor, PropertyDesc } from './descriptor-builder.js';


const properties = new Properties({} as Moddle);

expectType<Moddle>(properties.model);

const moddelElementStub = {} as ModdleElement;

properties.set(moddelElementStub, 'prop1', undefined);
properties.set(moddelElementStub, 'prop2', null);
properties.set(moddelElementStub, 'prop3', true);
properties.set(moddelElementStub, 'prop4', 1);
properties.set(moddelElementStub, 'prop5', 'string value');
properties.set(moddelElementStub, 'prop6', []);
properties.set(moddelElementStub, 'prop7', {} as ModdleElement);

expectType<undefined>(properties.get(moddelElementStub, 'prop1'));
expectType<null>(properties.get(moddelElementStub, 'prop2'));
expectType<boolean>(properties.get(moddelElementStub, 'prop3'));
expectType<number>(properties.get(moddelElementStub, 'prop4'));
expectType<string>(properties.get(moddelElementStub, 'prop5'));
expectType<Array<unknown>>(properties.get(moddelElementStub, 'prop6'));
expectType<ModdleElement>(properties.get(moddelElementStub, 'prop7'));

properties.define<ModdleElement>(moddelElementStub, '$foo', { writable: false } as PropertyDescriptor);
properties.define<{ foo: string }>({ foo: 'bar' }, '$baz', {} as PropertyDescriptor);

properties.defineDescriptor<ModdleElement>(moddelElementStub, {} as EffectiveDescriptor);
properties.defineDescriptor<{ foo: string }>({ foo: 'bar' }, {} as AnyTypeDescriptor);

properties.defineModel<ModdleElement>(moddelElementStub, {} as Moddle);
properties.defineModel<{ foo: string }>({ foo: 'bar' }, {} as Moddle);

expectType<PropertyDesc | null>(properties.getProperty(moddelElementStub, 'prop1'));
