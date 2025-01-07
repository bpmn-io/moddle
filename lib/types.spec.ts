import { expectType } from 'ts-expect';

import {
  BooleanType,
  coerceType,
  ElementType,
  IntegerType,
  isBuiltIn,
  isSimple,
  RealType,
  StringType
} from './types.js';

// when
const isBuiltInTypes = isBuiltIn('String') && isBuiltIn('Real') && isBuiltIn('Integer') && isBuiltIn('Boolean') &&
    isBuiltIn('Element');
// then
expectType<true>(isBuiltInTypes);


// when
const isBuiltInType = isBuiltIn('foo:bar');
// then
expectType<false>(isBuiltInType);


// when
const isSimpleTypes = isSimple('String') && isSimple('Real') && isSimple('Integer') && isSimple('Boolean');
// then
expectType<true>(isSimpleTypes);


// when
const isBuiltInPrimitives = isSimple('foo:bar') || isSimple('Element');
// then
expectType<false>(isBuiltInPrimitives);


// when
const stringValue = coerceType('String', 'string value');
// then
expectType<string>(stringValue);


// when
const realValue = coerceType('Real', '1.34');
// then
expectType<number>(realValue);


// when
const intValue = coerceType('Integer', '2');
// then
expectType<number>(intValue);


// when
const booleanValue = coerceType('Boolean', '2');
// then
expectType<boolean>(booleanValue);


// when
const objValue = coerceType('foo:bar', { foo: 'bar' });
// then
expectType<{ foo: string }>(objValue);


// when
const numArrayValue = coerceType('Element', [ 1 ]);
// then
expectType<number[]>(numArrayValue);


// asset valid type values
expectType<StringType>('String');
expectType<BooleanType>('Boolean');
expectType<IntegerType>('Integer');
expectType<RealType>('Real');
expectType<ElementType>('Element');