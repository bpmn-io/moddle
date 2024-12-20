# moddle Descriptor

The moddle descriptor is a JSON file that describes elements, their properties and relationships.


## Package Definition

The root of a descriptor file is a package definition.

```json
{
  "name": "SamplePackage",
  "prefix": "s",
  "types": [],
  "enumerations": []
}
```


#### Notes

The `prefix` uniquely identifies elements in a package if more multiple packages are in place.

The `types` collection contains all known types.

The `enumerations` and `associations` properties are reserved for future use.


## Type Definition

A type is a moddle element with a (package-) unique name and a list of properties.

```json
{
  "name": "Base",
  "properties": [
    { "name": "id", "type": "Number" },
    ...
  ]
}
```


### Inheritance

Types can inherit from one or more super types by specifying the `superClass` property.

```json
{
  "name": "Root",
  "superClass": [ "Base" ]
}
```

By inheriting from a super type, a type inherits all properties declared in the super type hierarchy.

Inherited properties will appear before own properties based on the order they are declared in the type hierarchy.


### Extending existing Types

Some meta-models require it to plug-in new properties that to certain existing model elements. This can be acomplished using the `extends` field. Consider the following type definition:

```json
{
  "name": "BetterRoot",
  "extends": [ "Root" ], 
  "properties": [
    { "name": "id", "type": "Number" }
  ]
}
```

With this model definition, every instance of `Root` will automatically have another property `BetterRoot#id` added. At the same time, instances of root will be instances of `BetterRoot`, too.

This extension is _implicit_ when compared to [inheritance](#inheritance). In the inheritance case one would need to instantiate `BetterRoot`, to actually get the new property `id`. Extending allows us to simply instantiate `Root` with the additional property defined for it.


## Property Definition

A property has a name, a type as well as a number of additional qualifiers and is added to a types `properties` list. 

```json
{
  "name": "stringProperty",
  "type": "String"
}
```

The `type` attribute may reference simple types such as `String`, `Boolean`, `Integer` or `Real` or any custom defined type.


### Qualifiers

Qualifiers can be used to further define a property.

| Qualifier | Values | Description |
| ------------- | ------------- | ----- |
| `isMany=false`        | `Boolean` | collection (i.e. list like) property |
| `isReference=false` | `Boolean` | reference to another object via its `id` property |
| `default` | simple type | the default value to set if non is defined |
| `redefines` | `String` (identifier) | redefines the property inherited from a super type, overriding `name`, `type` and qualifiers |


## Cross Package Referencing

Across packages, elements may be referenced via `packagePrefix:packageLocalName`.


### Example

Given we got two packages, a _base_ package, and a _domain_ package that builds on top of it.

```json
{
  "$schema": "https://unpkg.com/moddle/resources/schema/moddle.json",
  "name": "BasePackage",
  "prefix": "b",
  "types": [
    { "name": "Base" },
    {
      "name": "BaseWithId", 
      "superClass": [ "Base" ],
      "properties": [ { "name": "id", "type": "String" } ]
    }
  ]
}
```

The domain package may define its own types on top of the base package by referencing properties and types defined in the base package via their name, prefixed with `b:`.

```json
{
  "$schema": "https://unpkg.com/moddle/resources/schema/moddle.json",
  "name": "DomainPackage",
  "prefix": "d",
  "types": [
    {
      "name": "Base",
      "superClass": [ "b:BaseWithId" ],
      "properties": [
        {
          "name": "id",
          "type": "Integer",
          "redefines": "b:BaseWithId#id"
        }
      ]
    },
    {
      "name": "Root", 
      "properties": [
        { "name": "elements", "type": "b:Base", "isMany": true }
      ]
    }
  ]
}
```

To instantiate the domain package as part of a moddle instance, the base package must be provided, too.


### External Links

Valid locations for externally defined types and properties are

* a types `superClass` attribute
* a properties `type` attribute
* a properties `redefines` attribute (e.g. to redefine a property inherited from an externally defined type)


## Serializing to XML

Reading and writing XML from moddle is possible via [moddle-xml](https://github.com/bpmn-io/moddle-xml). It requires [additional meta-data](https://github.com/bpmn-io/moddle-xml/blob/master/docs/descriptor-xml.md) to be specified in your moddle descriptor.


## Validating the Schema

A [JSON schema](../resources/schema/moddle.json) is available, include it via the `$schema` attribute in your moddle descriptor and it will be picked up by code editor:

```json
{
  "$schema": "https://unpkg.com/moddle/resources/schema/moddle.json",
  ...
}
```
