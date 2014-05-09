var slice = Array.prototype.slice;
module.exports = function extend() {
    return new (slice.call(arguments).reduce(apply, F))();
};
function F(){}
function apply(ctor, proto) {
    ctor.prototype = proto;
    F.prototype = new ctor()
    return F;
}