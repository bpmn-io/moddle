# Changelog

All notable changes to [moddle](https://github.com/bpmn-io/moddle) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

## 6.2.3

* `FIX`: mark accessors as non-enumerable ([#55](https://github.com/bpmn-io/moddle/pull/55))

## 6.2.2

* `FIX`: add accessors for elements created by `createAny` ([#54](https://github.com/bpmn-io/moddle/pull/54))

## 6.2.1

* `FIX`: allow self-extension using local name ([#52](https://github.com/bpmn-io/moddle/pull/52))

## 6.2.0

* `FEAT`: add ability to configure moddle ([#48](https://github.com/bpmn-io/moddle/pull/48))
* `FEAT`: add ability to explicitly mark property as global ([#48](https://github.com/bpmn-io/moddle/pull/48))
* `FEAT`: add `strict` mode / ability to log unknown property access ([#48](https://github.com/bpmn-io/moddle/pull/48))

## 6.1.0

* `FEAT`: improve error thrown on trait introspection ([#38](https://github.com/bpmn-io/moddle/issues/38), [#46](https://github.com/bpmn-io/moddle/pull/46))
* `FIX`: correctly handle `inherits` flag with multiple parents ([#47](https://github.com/bpmn-io/moddle/pull/47))

## 6.0.0

* `DEPS`: bump to `min-dash@4`
* `CHORE`: turn into ES module

## 5.0.4

* `FIX`: guard against `ModdleElement#set` miss-use ([#43](https://github.com/bpmn-io/moddle/issues/43))

## 5.0.3

* `FIX`: use getters for read-only properties ([#40](https://github.com/bpmn-io/moddle/pull/40))
* `CHORE`: add prepare script ([#33](https://github.com/bpmn-io/moddle/pull/33)))

## 5.0.2

* `FIX`: make `Any` type `$instanceOf` member non-enumerable

## 5.0.1

* `CHORE`: cleanup pre-built distribution

## 5.0.0

* `CHORE`: expose `{ Moddle }` and utilities
* `CHORE`: provide pre-packaged distribution

### Breaking Changes

* We expose `Moddle` as a named export now.
* We do not publish `lib` folder anymore, destructure the provided default export.
* No need for `esm` to consume the library anymore.

## 4.1.0

* `CHORE`: bump utility toolbelt

## 4.0.0

### Breaking Changes

* `FEAT`: migrate to ES modules. Use `esm` or a ES module aware transpiler to consume this library.

## 3.0.0

* `FEAT`: drop lodash in favor of [min-dash](https://github.com/bpmn-io/min-dash)

## ...

Check `git log` for earlier history.