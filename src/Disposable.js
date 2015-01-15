
var spread = require('./support/spread'),
    push = Array.prototype.push;

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

var empty = new Disposable(function(){});
Disposable.empty = function() { return empty; };
Disposable.create = function(dispose) {
    return new Disposable(dispose);
};

function dispose(f) {
    if(!this.disposed) {
        this.disposed = true;
        (f = this._dispose) && f();
        var xs = this._disposables, i = -1, n, x;
        if(!!xs && (n = xs.length)) {
            delete this._disposables;
            while(++i < n) {
                (x = xs[i]) && x.dispose();
            }
            delete this._disposables;
        }
    }
    return true;
}

function add() {
    return (this.length = push.apply(
        this._disposables || (this._disposables = []),
        arguments)) && this || this;
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
