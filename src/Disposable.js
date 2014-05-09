var noop = require('./support/noop'),
    slice = Array.prototype.slice,
    isArray = Array.isArray;

var E = Disposable.E = Object.freeze({dispose: noop, disposed: true});
Disposable.create = create;
Disposable.empty = empty;

Disposable.prototype.activate = activate;
Disposable.prototype.dispose = dispose;
Disposable.prototype.add = add;
Disposable.prototype.remove = remove;

module.exports = Disposable;

function Disposable(disposeAction) {
    this.disposed = false;
    this.disposeAction = disposeAction;
    return this;
}

function create() {
    return arguments.length > 1 ?
        add.apply(new Disposable(disposeAll), arguments) :
        new Disposable(arguments[0]);
}

function empty() {
    return E;
}

function activate() {
    this.disposed = false;
    return this;
}

function dispose() {
    if(this.disposed === false) {
        this.disposed = true;
        if(typeof this.disposeAction === 'function') {
            this.disposeAction();
        }/* else {
            console.log('unexpected typeof disposeAction:', typeof this.disposeAction);
        }*/
        this.disposeAction = undefined;
    }
    return this;
}

function disposeAll() {
    var xs = this.disposables,
        i = -1, n = xs ? xs.length : 0;
    while(++i < n) {
        xs[i].dispose();
        delete xs[i];
    }
    this.disposables = undefined;
}

function add() {
    if(arguments.length > 0) {
        var xs = this.disposables,
            ds = resolve.apply(this, arguments),
            a, j, d, i = -1, n = ds.length;
        
        if(this.disposed === true) {
            while(++i < n) {
                ds[i].dispose();
            }
        } else {
            if(!xs) {
                this.disposables = xs = [];
                if((a = this.disposeAction) && a !== disposeAll) {
                    xs[0] = new Disposable(a);
                    this.disposeAction = disposeAll;
                }
            }
            j = xs.length;
            while(++i < n) {
                if((d = ds[i]) !== this) {
                    xs[j++] = d;
                }
            }
        }
    }
    return this;
}

function remove() {
    if(arguments.length > 0) {
        var xs = this.disposables;
        if(xs) {
            var ds = slice.call(arguments),
                j, i = -1, n = ds.length;
            while(++i) {
                if((j = xs.indexOf(ds[i])) !== -1) {
                    xs.splice(j, 1);
                }
            }
        }
    }
    return this;
}

function resolve() {
    
    var a = [], d, dt,
        i = -1, n = arguments.length;
    
    if(n === 0) {
        return a;
    }
    
    while(++i < n) {
        d = arguments[i];
        if(d) {
            if((dt = typeof d) === 'function') {
                a[i] = new Disposable(d);
            } else if(dt === 'object') {
                if(isArray(d)) {
                    a[i] = add.apply(new Disposable(disposeAll), d);
                } else if(d.disposed !== true) {
                    a[i] = d;
                }
            }
        }
    }
    return a;
}