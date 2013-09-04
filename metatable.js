if (typeof module !== 'undefined') {
    module.exports = function(d3) {
        return metatable;
    };
}

function metatable() {
    var event = d3.dispatch('change', 'rowfocus');

    function table(selection) {
        selection.each(function(d) {
            var sel = d3.select(this),
                table;

            var keyset = d3.set();
            d.map(Object.keys).forEach(function(k) {
                k.forEach(function(_) {
                    keyset.add(_);
                });
            });

            bootstrap();
            paint();

            function bootstrap() {

                var controls = sel.selectAll('.controls')
                    .data([d])
                    .enter()
                    .append('div')
                    .attr('class', 'controls');

                var colbutton = controls.append('button')
                    .on('click', function() {
                        var name = prompt('column name');
                        if (name) {
                            keyset.add(name);
                            paint();
                        }
                    });
                colbutton.append('span').attr('class', 'icon-plus');
                colbutton.append('span').text(' new column');

                var enter = sel.selectAll('table').data([d]).enter().append('table');
                var thead = enter.append('thead');
                var tbody = enter.append('tbody');
                var tr = thead.append('tr');

                table = sel.select('table');
            }

            function paint() {

                var keys = keyset.values();

                var th = table
                    .select('thead')
                    .select('tr')
                    .selectAll('th')
                    .data(keys, function(d) { return d; });

                var delbutton = th.enter().append('th')
                    .append('span')
                    .text(String)
                    .append('button');

                th.exit().remove();

                var tr = table.select('tbody').selectAll('tr')
                    .data(function(d) { return d; });

                tr.enter()
                  .append('tr');

                tr.exit().remove();

                var td = tr.selectAll('td')
                    .data(keys, function(d) { return d; });

                td.enter()
                    .append('td')
                    .append('input')
                    .attr('field', String);

                td.exit().remove();

                delbutton.on('click', function(d) {
                        var name = d;
                        if (confirm('Delete column ' + name + '?')) {
                            keyset.remove(name);
                            tr.selectAll('input')
                                .data(function(d, i) {
                                    var map = d3.map(d);
                                    map.remove(name);
                                    var reduced = map.entries()
                                        .reduce(function(memo, d) {
                                            memo[d.key] = d.value;
                                            return memo;
                                        }, {});
                                    event.change(reduced, i);
                                    return {
                                        data: reduced,
                                        index: i
                                    };
                                });
                            paint();
                        }
                    });
                delbutton.append('span').attr('class', 'icon-minus');
                delbutton.append('span').text(' delete');

                function write(d) {
                    d.data[d3.select(this).attr('field')] = this.value;
                    event.change(d.data, d.index);
                }

                tr.selectAll('input')
                    .data(function(d, i) {
                        return d3.range(keys.length).map(function() {
                            return {
                                data: d,
                                index: i
                            };
                        });
                    })
                    .classed('disabled', function(d) {
                        return d.data[d3.select(this).attr('field')] === undefined;
                    })
                    .property('value', function(d) {
                        return d.data[d3.select(this).attr('field')] || '';
                    })
                    .on('keyup', write)
                    .on('change', write)
                    .on('click', function(d) {
                        if (d.data[d3.select(this).attr('field')] === undefined) {
                            d.data[d3.select(this).attr('field')] = '';
                            paint();
                        }
                    })
                    .on('focus', function(d) {
                        event.rowfocus(d.data, d.index);
                    });
            }
        });
    }

    return d3.rebind(table, event, 'on');
}
