import { parseName } from './ns';
import { expectType } from 'ts-expect';

const { name, localName, prefix } = parseName('foo:bar');
console.log('foo:bar', name, localName, prefix);

expectType<{ name: string, localName: string, prefix: string }>(parseName('foo:bar', 'baz'));
