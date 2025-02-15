import { expectType } from 'ts-expect';

import Factory, { AnyModdleElement, ModdleElement, ModdleElementType } from './factory.js';
import { Moddle } from './index.js';
import { EffectiveDescriptor } from './registry.js';
import Base from './base.js';
import Properties from './properties.js';

const factory = new Factory({} as Moddle, {} as Properties);


// when
const elementTypeFromFactory = factory.createType({} as EffectiveDescriptor);
// then
expectType<ModdleElementType>(elementTypeFromFactory);


// when
const Element = factory.createType<{ foo: string }>({} as EffectiveDescriptor);
// then
expectType<ModdleElementType<{ foo: string }>>(Element);


// when
const element = new Element();
// then
expectType<string | undefined>(element.foo);
expectType<string>(element.$type);
expectType<Moddle>(element.$model);


// asset valid type values

// when
const moddelElementStub = {} as ModdleElement<{ foo: string, bar: number, baz: ModdleElement }>;
// then
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


// when
const fuzzyElement = {} as ModdleElement;
// then
expectType<any>(fuzzyElement.someProperty);


// when
type RefType = { foo: string, bar: number, baz: ModdleElement };
const ModdelElementType = {} as ModdleElementType<RefType>;
const moddelElementType = new ModdelElementType({ foo: 'bar' });
// then
expectType<ModdleElement<RefType>>(moddelElementType);
expectType<Moddle>(ModdelElementType.$model);
expectType<EffectiveDescriptor>(ModdelElementType.$descriptor);
expectType<ModdleElement<RefType>>(ModdelElementType.prototype);