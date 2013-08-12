## d3-metatable

A table view component for [d3js](http://d3js.org/) designed for JSON
objects of varying schemas.

### example

```js
container.append('div')
    .data([props])
    .call(
        metatable()
            .on('change', function() {
                // a row's data is changed
            })
            .on('rowfocus', function(d) {
                // a row is focused
            })
```

### api

```js
metatable()
```

A behavior that expects to be called with a selection an array of objects
of data. Emits events:

* rowfocus: a row is focused. returns the object
* change: a row is changed. returns the object
