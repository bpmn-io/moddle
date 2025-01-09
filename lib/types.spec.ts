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


expectType<StringType>('String');
expectType<BooleanType>('Boolean');
expectType<IntegerType>('Integer');
expectType<RealType>('Real');
expectType<ElementType>('Element');

expectType<true>(isBuiltIn('String'));
expectType<true>(isBuiltIn('Real'));
expectType<true>(isBuiltIn('Integer'));
expectType<true>(isBuiltIn('Boolean'));
expectType<true>(isBuiltIn('Element'));
expectType<false>(isBuiltIn('foo:bar'));

expectType<true>(isSimple('String'));
expectType<true>(isSimple('Real'));
expectType<true>(isSimple('Integer'));
expectType<true>(isSimple('Boolean'));
expectType<false>(isSimple('foo:bar'));
expectType<false>(isSimple('Element'));

expectType<string>(coerceType('String', 'string value'));
expectType<number>(coerceType('Real', '1'));
expectType<number>(coerceType('Integer', '2'));
expectType<boolean>(coerceType('Boolean', '2'));
expectType<{ foo: 'bar' }>(coerceType('foo:bar', { foo: 'bar' }));
expectType<number[]>(coerceType('Element', [1]));