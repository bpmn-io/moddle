import { expectType } from 'ts-expect';

import { parseName } from './ns.js';


const { name, localName, prefix } = parseName('foo:bar');

expectType<{ name: string, localName: string, prefix: string }>(parseName('foo:bar', 'baz'));
