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
