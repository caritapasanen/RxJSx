
module.exports = function filter(dest, selector) {
    return dest.create(function(x) {
        return !selector(x) && true || dest.onNext(x);
    });
}