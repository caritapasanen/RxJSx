var slice  = Array.prototype.slice,
    spread = require('./support/spread');

function toDisposables() {
    return arguments.length == 0 ?
        [] :
        spread(arguments).reduce(function(a, d) {
            if(typeof d === 'function') {
                a.push({dispose: d});
            } else if(d && d.dispose) {
                a.push(d);
            }
            return a;
        }, []);
}

function Disposable() {
    this._disposables = toDisposables.apply(null, arguments);
    this.length = this._disposables.length;
}

Disposable.create = function() {
    return new Disposable(slice.call(arguments));
}

Disposable.prototype.dispose = function() {
    var disposables = this._disposables,
        i = -1, n = disposables.length;
    while(++i < n) {
        disposables[i].dispose();
    }
    this._disposables = [];
    this.length = 0;
    return this;
}

Disposable.prototype.add = function() {
    var disposables = this._disposables;
    disposables.push.apply(disposables, toDisposables.apply(null, arguments));
    this.length = disposables.length;
    return this;
}

Disposable.prototype.remove = function() {
    this._disposables = spread(arguments).reduce(function(ds, d, i) {
        i = ds.indexOf(d);
        if(i > -1) {
            if(i == 0) {
                ds = ds.slice(1);
            } else if(i === ds.length) {
                ds = ds.slice(0, -1)
            } else {
                ds = ds.slice(0, i).concat(ds.slice(i + 1));
            }
        }
        return ds;
    }, this._disposables);
    this.length = this._disposables.length;
    return this;
}

module.exports = Disposable;