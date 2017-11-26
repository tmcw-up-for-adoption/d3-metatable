import {select, event} from 'd3-selection';
import {dispatch} from 'd3-dispatch';
import {range} from 'd3-array';
import {map, set} from 'd3-collection';

export default function (options) {
    var dispatcher = dispatch('change', 'rowfocus', 'renameprompt', 'deleteprompt');
    var _renamePrompt = true;
    var _deletePrompt = true;

    options = options || {};

    var config = {
        newCol: options.newCol !== false,
        renameCol: options.renameCol !== false,
        deleteCol: options.deleteCol !== false
    };

    function table(selection) {
        selection.each(function(d) {
            var sel = select(this),
                table;

            var keyset = set();
            d.map(Object.keys).forEach(function(k) {
                k.forEach(function(_) {
                    keyset.add(_);
                });
            });

            var keys = keyset.values();

            bootstrap();
            paint();

            dispatcher.preventprompt = function(which) {
                switch(which) {
                    case 'rename':
                        _renamePrompt = false;
                    break;
                    case 'delete':
                        _deletePrompt = false;
                    break;
                }
            };

            function bootstrap() {

                var controls = sel.selectAll('.controls')
                    .data([d])
                    .enter()
                    .append('div');

                if (config.newCol) {
                    controls.append('a')
                        .text('New column')
                        .attr('href', '#')
                        .attr('class', 'button icon plus')
                        .on('click', function() {
                            event.preventDefault();
                            var name = prompt('column name');
                            if (name) {
                                keyset.add(name);
                                paint();
                            }
                        });
                }

                var enter = sel.selectAll('table').data([d]).enter().append('table');
                var thead = enter.append('thead');
                var tbody = enter.append('tbody');
                var tr = thead.append('tr');

                table = sel.select('table');
            }

            function paint() {

                var th = table
                    .select('thead')
                    .select('tr')
                    .selectAll('th')
                    .data(keys, function(d) { return d; });

                th.exit().remove();

                var thEnter = th.enter()
                    .append('th')
                    .text(String);

                var actionLinks = thEnter
                    .append('div')
                    .attr('class', 'small');

                if (config.deleteCol) {
                    actionLinks
                        .append('a')
                        .attr('href', '#')
                        .attr('class', 'icon trash')
                        .text('Delete')
                        .on('click', deleteClick);
                }

                if (config.renameCol) {
                    actionLinks
                        .append('a')
                        .attr('href', '#')
                        .attr('class', 'icon pencil')
                        .text('Rename')
                        .on('click', renameClick);
                }

                var tr = table.select('tbody').selectAll('tr')
                    .data(function(d) { return d; });

                tr.exit().remove();

                tr = tr.enter().append('tr').merge(tr);

                var td = tr.selectAll('td')
                    .data(keys, function(d) { return d; });

                td.exit().remove();

                td.enter()
                    .append('td')
                    .append('textarea')
                    .attr('field', String);

                function deleteClick(d) {
                    event.preventDefault();
                    var name = d;
                    dispatcher.call('deleteprompt', dispatcher, d, completeDelete);
                    if (_deletePrompt && confirm('Delete column ' + name + '?')) {
                        completeDelete(d);
                    }
                    _deletePrompt = true;
                }

                function completeDelete(name) {
                    keys.splice(keys.indexOf(name), 1);
                    tr.selectAll('textarea')
                        .data(function(d, i) {
                            var m = map(d);
                            m.remove(name);
                            var reduced = mapToObject(m);
                            dispatcher.call('change', dispatcher, reduced, i);
                            return {
                                data: reduced,
                                index: i
                            };
                        });
                    paint();
                }

                function renameClick(d) {
                    event.preventDefault();
                    var name = d;
                    dispatcher.call('renameprompt', dispatcher, d, completeRename);

                    var newname = (_renamePrompt) ?
                        prompt('New name for column ' + name + '?') :
                        undefined;

                    if (_renamePrompt && newname) {
                        completeRename(newname, name);
                    }

                    _renamePrompt = true;
                }

                function completeRename(value, name) {
                    keys.splice(keys.indexOf(name), 1, value);
                    tr.selectAll('textarea')
                        .data(function(d, i) {
                            var m = map(d);
                            m.set(value, m.get(name));
                            m.remove(name);
                            var reduced = mapToObject(m);
                            dispatcher.call('change', dispatcher, reduced, i);
                            return {
                                data: reduced,
                                index: i
                            };
                        });
                    paint();
                }

                function coerceNum(x) {
                    var fl = parseFloat(x);
                    if (fl.toString() === x) return fl;
                    else return x;
                }

                function write(d) {
                    d.data[select(this).attr('field')] = coerceNum(this.value);
                    dispatcher.call('change', dispatcher, d.data, d.index);
                }

                function mapToObject(m) {
                    return m.entries()
                        .reduce(function(memo, d) {
                            memo[d.key] = d.value;
                            return memo;
                        }, {});
                }

                tr.selectAll('textarea')
                    .data(function(d, i) {
                        return range(keys.length).map(function() {
                            return {
                                data: d,
                                index: i
                            };
                        });
                    })
                    .classed('disabled', function(d) {
                        return d.data[select(this).attr('field')] === undefined;
                    })
                    .property('value', function(d) {
                        var value = d.data[select(this).attr('field')];
                        return !isNaN(value) ? value : value || '';
                    })
                    .on('keyup', write)
                    .on('change', write)
                    .on('click', function(d) {
                        if (d.data[select(this).attr('field')] === undefined) {
                            d.data[select(this).attr('field')] = '';
                            paint();
                        }
                    })
                    .on('focus', function(d) {
                        dispatcher.call('rowfocus', dispatcher, d.data, d.index);
                    });
            }
        });
    }

    table.on = function () {
      dispatcher.on.apply(dispatcher, arguments);
      return table;
    };

    return table;
}
