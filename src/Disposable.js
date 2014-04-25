var spread = require('./support/spread');

function toDisposables() {
    return spread(arguments).reduce(function(a, d) {
        if(typeof d === 'function') {
            a.push({dispose: d});
        } else {
            a.push(d);
        }
        return a;
    }, []);
}

function Disposable() {
    this._disposables = toDisposables(arguments);
    this.length = this._disposables.length;
}

Disposable.create = function() {
    return new Disposable(arguments);
}

Disposable.prototype.dispose = function() {
    var disposables = this._disposables, i = -1, n;
    if(typeof disposables !== 'undefined') {
        n = disposables.length;
        while(++i < n) {
            disposables[i].dispose();
        }
        this.length = 0;
        this._disposables = undefined;
    }
    return this;
}

Disposable.prototype.add = function() {
    var disposables = this._disposables;
    if(typeof disposables === 'undefined') {
        disposables = this._disposables = [];
    }
    disposables.push.apply(disposables, toDisposables(arguments));
    this.length = disposables.length;
    return this;
}

Disposable.prototype.remove = function() {
    var disposables = this._disposables, i;
    if(typeof disposables !== 'undefined') {
        disposables = spread(arguments).reduce(function(ds, d) {
            i = ds.indexOf(d);
            if(i > -1) {
                ds.splice(i, 1);
            }
            return ds;
        }, disposables);
        if(disposables.length === 0) {
            disposables = this._disposables = undefined;
        }
        this.length = disposables ? disposables.length : 0;
    }
    return this;
}

module.exports = Disposable;