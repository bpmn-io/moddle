# moddle

A utility library for working with meta-model based data structures.


## What is it good for?

__moddle__ offers you a concise way to define [meta models](https://en.wikipedia.org/wiki/Metamodeling) in JavaScript. You can use these models to consume documents, create model elements and perform model validation.

A moddle description is a simple [JSON](http://json.org/) file that describes types, their properties and relationships:

```
{
  "name": "Cars",
  "uri": "http://cars",
  "prefix": "c",
  "types": [
    {
      "name": "Base",
      "properties": [
        { "name": "id", "type": "String", "isAttr": true }
      ]
    },
    {
      "name": "Root",
      "superClass": [ "Base" ],
      "properties": [
        { "name": "cars", "type": "Car", "isMany": true }
      ]
    },
    {
      "name": "Car",
      "superClass": [ "Base" ],
      "properties": [
        { "name": "name", "type": "String", "isAttr": true, "default": "No Name" },
        { "name": "power", "type": "Integer", "isAttr": true },
        { "name": "similar", "type": "Car", "isMany": true, "isReference": true }
      ]
    }
  ]
}
```

__moddle__ allows you to instantiate that definition and create objects from it:

```
var Moddle = require('moddle');

var cars = new Moddle([ carsJSON ]);

var taiga = cars.create('c:Car', { name: 'Taiga' });

console.log(taiga);
// { $type: 'c:Car', name: 'Taiga' };


var cheapCar = cars.create('c:Car');

console.log(cheapCar.name);
// "No Name"


// really?
cheapCar.get('similar').push(taiga);
```

Then again, __moddle__ allows you to perform introspection on model instances, too.

```
var carDescriptor = cheapCar.$descriptor;

console.log(carDescriptor.properties);
// [ { name: 'id', type: 'String', ... }, { name: 'name', type: 'String', ...} ... ]
```


## License

MIT
