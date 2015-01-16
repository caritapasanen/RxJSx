
var spread = require('rx/support/spread');

function Disposable(dispose) {
    this._dispose = dispose;
    this.disposed = false;
    return this;
}

module.exports = Disposable;

Disposable.prototype.add = add;
Disposable.prototype.remove = remove;
Disposable.prototype.dispose = dispose;
Disposable.prototype.length = 0;

var empty = new Disposable();
empty.disposed = true;
Disposable.empty = function() { return empty; };
Disposable.create = function(dispose) {
    return new Disposable(dispose);
};

function dispose() {
    if(!this.disposed) {
        this.disposed = true;
        var f, xs = this._disposables, i, n;
        (f = this._dispose) && f();
        if(!!xs && (n = xs.length) && (i = -1)) {
            delete this._disposables;
            while(++i < n) {
                xs[i].dispose();
            }
            delete this._disposables;
        }
    }
    return true;
}

function add() {
    var xs = this._disposables || (this._disposables = []),
        ys = arguments, j = xs.length, i = -1, n = ys.length,
        xd = this.disposed, x;
    while(++i < n) {
        (x = ys[i]) &&
        (typeof x === 'object') &&
        (!x.disposed) && (typeof x.dispose === 'function') && (
            xd && x.dispose() || (xs[j++] = x));
    }
    return this;
}

function remove() {
    var xs = this._disposables, ys = spread(arguments);
    if(xs && xs.length && ys.length) {
        var x, zs = [], i = -1, j = -1, n = xs.length;
        while(++i < n) {
            if(~(x = ys.indexOf(xs[i]))) {
                ys.splice(x, 1);
                if(ys.length == 0) {
                    while(++i < n) {
                        zs[++j] = xs[i];
                    }
                    break;
                }
            } else {
                zs[++j] = xs[i];
            }
        }
        this._disposables = ~j && zs || undefined;
        this.length = ~j && (j + 1);
    }
    return this;
}
