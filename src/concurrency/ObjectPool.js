
function ObjectPool(create, recycle, dispose) {
    this.items = [];
    
    this.request = (function request() {
        var a = this.items,  n = a.length,
            x;
        return (
            (--n >= 0) &&
            (x = a[n]) &&
            (delete a[n]) &&
            ((a.length = n) > -1)
        ) ? recycle.apply(x, arguments) : create.apply(null, arguments);
    }).bind(this);
    
    this.release = (function release(item) {
        var a = this.items, n = a.length;
        return (++a.length && (a[n] = dispose(item) || item));
    }).bind(this);
    
    this.resize  = (function resize(newSize) {
        if(newSize < 0) {
            newSize = 0;
        }
        this.items = this.items.slice(0, newSize);
        return this;
    }).bind(this);
}

module.exports = ObjectPool;