import { expectType } from 'ts-expect';

import { parseName } from './ns.js';

// when
const ns = parseName('foo:bar', 'baz');
// then
expectType<{ name: string, localName: string, prefix: string }>(ns);


// when
const { prefix } = parseName('foo:bar');
// then
expectType<string>(prefix);
