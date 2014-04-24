var concat = Array.prototype.concat
    , slice = Array.prototype.slice
    , isArray = Array.isArray
    ;

module.exports = function spread(arguments) {
    return flatten(slice.call(arguments));
}

function flatten(x) {
    return isArray(x) ? flatMap(x, flatten) : x;
}

function flatMap(x, f) {
    return concat.apply([], x.map(f));
}