import Factory, { AnyModdleElement, ModdleElement, ModdleElementType } from './factory';
import { expectType } from 'ts-expect';
import { Moddle } from './index';
import { EffectiveDescriptor } from './registry';
import Base from './base';
import { AnyTypeDescriptor } from './descriptor-builder';
import Properties from './properties';

const moddelElementStub = {} as ModdleElement<{ foo: string, bar: number, baz: ModdleElement }>;

expectType<Base['get']>(moddelElementStub.get);
expectType<Base['set']>(moddelElementStub.set);
expectType<Moddle>(moddelElementStub.$model);
expectType<EffectiveDescriptor>(moddelElementStub.$descriptor);
expectType<string>(moddelElementStub.$type);
expectType<Record<string, any>>(moddelElementStub.$attrs);
expectType<ModdleElement | AnyModdleElement>(moddelElementStub.$parent);
expectType<Moddle['hasType']>(moddelElementStub.hasType);
expectType<ModdleElement['hasType']>(moddelElementStub.$instanceOf);
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
expectType<ModdleElement | AnyModdleElement>(anyModdelElement.$parent);
expectType<Moddle>(anyModdelElement.$model);
expectType<AnyTypeDescriptor>(anyModdelElement.$descriptor);

const factory = new Factory({} as Moddle, {} as Properties);

expectType<Moddle>(factory.model);
expectType<Properties>(factory.properties);
expectType<ModdleElementType>(factory.createType({} as EffectiveDescriptor));
expectType<ModdleElementType<{ foo: string }>>(factory.createType<{ foo: string }>({} as EffectiveDescriptor));

