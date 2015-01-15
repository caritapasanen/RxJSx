
function ObjectPool(create, recycle, dispose) {
    this.items = [];
    this.create = create;
    this.recycle = recycle;
    this.dispose = dispose;
}

ObjectPool.prototype.request = request;
ObjectPool.prototype.release = release;
ObjectPool.prototype.resize  = resize;

function request() {
    var a = this.items,  n = a.length, x;
    return (
        (--n >= 0) &&
        (x = a[n]) &&
        (delete a[n]) &&
        ((a.length = n) > -1)
    ) ? this.recycle.apply(x, arguments) : this.create.apply(null, arguments);
}

function release(item) {
    var a = this.items, n = a.length;
    return (++a.length && this.dispose(item) && (a[n] = item));
}

function resize() {
    if(newSize < 0) {
        newSize = 0;
    }
    this.items = this.items.slice(0, newSize);
    return this;
}

module.exports = ObjectPool;