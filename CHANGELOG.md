# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="1.0.1"></a>
## [1.0.1](https://github.com/mapbox/d3-metatable/compare/v1.0.0...v1.0.1) (2017-12-03)



<a name="1.0.0"></a>
# [1.0.0](https://github.com/mapbox/d3-metatable/compare/v0.3.0...v1.0.0) (2017-11-27)


### Features

* Compatibility with d3 v4 & ES6 modules ([33f7864](https://github.com/mapbox/d3-metatable/commit/33f7864))


### BREAKING CHANGES

* will no longer play well with d3 v3.



### v0.4.0

- Interfaces like `renameCol`, `deleteCol`, and `newCol` can now be disabled
if the option is passed in metatable.
- Allow a client to pass in a custom interface for renaming or deleting a column.
- HTML Markup cleanup
- Adds `renameprompt` and `deleteprompt` events to disable default behaviour with users own.
