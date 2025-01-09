import { expectType } from 'ts-expect';

import Factory, { AnyModdleElement, ModdleElement, ModdleElementType } from './factory.js';
import { Moddle } from './index.js';
import { EffectiveDescriptor } from './registry.js';
import Base from './base.js';
import { AnyTypeDescriptor } from './descriptor-builder.js';
import Properties from './properties.js';


const moddelElementStub = {} as ModdleElement<{ foo: string, bar: number, baz: ModdleElement }>;

expectType<Base['get']>(moddelElementStub.get);
expectType<Base['set']>(moddelElementStub.set);
expectType<Moddle>(moddelElementStub.$model);
expectType<EffectiveDescriptor>(moddelElementStub.$descriptor);
expectType<string>(moddelElementStub.$type);
expectType<Record<string, any>>(moddelElementStub.$attrs);
expectType<Moddle['hasType']>(moddelElementStub.hasType);
expectType<ModdleElement['hasType']>(moddelElementStub.$instanceOf);
expectType<ModdleElement | AnyModdleElement | undefined>(moddelElementStub.$parent);
expectType<string>(moddelElementStub.foo);
expectType<number>(moddelElementStub.bar);
expectType<ModdleElement>(moddelElementStub.baz);

expectType<any>(({} as ModdleElement).someProperty);

const ModdelElementType = {} as ModdleElementType<{ foo: string, bar: number, baz: ModdleElement }>;

expectType<ModdleElement<{ foo: string, bar: number, baz: ModdleElement }>>(new ModdelElementType({ foo: 'bar' }));
expectType<Moddle>(ModdelElementType.$model);
expectType<EffectiveDescriptor>(ModdelElementType.$descriptor);
expectType<ModdleElement<{ foo: string, bar: number, baz: ModdleElement }>>(ModdelElementType.prototype);

const anyModdelElement = {} as AnyModdleElement<{ foo: string, bar: number, baz: ModdleElement }>;

expectType<Base['get']>(anyModdelElement.get);
expectType<Base['set']>(anyModdelElement.set);
expectType<string>(anyModdelElement.foo);
expectType<number>(anyModdelElement.bar);
expectType<ModdleElement>(anyModdelElement.baz);
expectType<string>(anyModdelElement.$type);
expectType<(type: string) => boolean>(anyModdelElement.$instanceOf);
expectType<ModdleElement | AnyModdleElement | undefined>(anyModdelElement.$parent);
expectType<Moddle>(anyModdelElement.$model);
expectType<AnyTypeDescriptor>(anyModdelElement.$descriptor);

const factory = new Factory({} as Moddle, {} as Properties);

expectType<ModdleElementType>(factory.createType({} as EffectiveDescriptor));

// when
const Element = factory.createType<{ foo: string }>({} as EffectiveDescriptor);

// then
expectType<ModdleElementType<{ foo: string }>>(Element);

const element = new Element();

expectType<string | undefined>(element.foo);
expectType<string>(element.$type);
expectType<Moddle>(element.$model);