import { expectType } from 'ts-expect';

import Base from './base.js';


const baseElement = new Base();

baseElement.set('prop1', true);
baseElement.set('prop2', 123);
baseElement.set('prop3', 'string value');
baseElement.set('prop4', null);
baseElement.set('prop5', undefined);
baseElement.set('prop6', { foo: null });
baseElement.set('prop7', [ true, 123, null, undefined, 'string value', { foo: null } ]);

baseElement.get('prop1');


class Derived extends Base {
  n: number = 10;
}

const derived = new Derived();

// implicit typing (based on derived shape)
expectType<number>(derived.get('n'));

// no type, must be explicitly casted
expectType<unknown>(derived.get('unknown'));

// explicit type expected
expectType<string>(derived.get<string>('unknown'));

derived.set('n', 100);

// we validate known types when setting
// @ts-expect-error
derived.set('n', 'not compatible')

// we tolerate setting <unknown> property
derived.set('custom:n', [ 1, 2, 3 ])

class NestedDerived extends Derived {
  foo: string = "BAR"
}

const nestedDerived = new NestedDerived();

// implicit typing (based on derived shape)
expectType<number>(nestedDerived.get('n'));

// no type, must be explicitly casted
expectType<unknown>(nestedDerived.get('unknown'));

// explicit type expected
expectType<string>(nestedDerived.get<string>('unknown'));

nestedDerived.set('n', 100);

// we validate known types when setting
// @ts-expect-error
nestedDerived.set('n', 'not compatible')

// we tolerate setting <unknown> property
nestedDerived.set('custom:n', [ 1, 2, 3 ])


class Complex extends Base {
  d : Derived | undefined;
}

const complex = new Complex();

// implicit typing (based on derived shape)
complex.set('d', derived);

// implicit typing (based on derived shape, accepting compatible types)
complex.set('d', nestedDerived);

// we validate known types when setting
// @ts-expect-error
complex.set('d', 'not compatible')