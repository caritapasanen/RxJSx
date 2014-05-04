function ObjectPool(create, recycle, dispose) {
    this.items = [];
    this.create = create;
    this.recycle = recycle;
    this.dispose = dispose;
}

ObjectPool.prototype.get = get;
ObjectPool.prototype.put = put;
ObjectPool.prototype.release = release;

function get() {
    var c = this.create, r = this.recycle,
        a = this.items,  n = a.length,
        x;
    return (
        (--n >= 0) &&
        (x = a[n]) &&
        (delete a[n]) &&
        ((a.length = n) > -1)
    ) ? r.apply(x, arguments) : c.apply(null, arguments);
}

function put(item) {
    var a = this.items, n = a.length;
    return (++a.length && (a[n] = this.dispose(item) || item));
}

function release(newSize) {
    if(newSize < 0) {
        newSize = 0;
    }
    this.items = this.items.slice(0, newSize);
    return this;
}

module.exports = ObjectPool;