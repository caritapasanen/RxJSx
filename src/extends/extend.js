// A generic `extend` implementation. Slower on create because
// it calls `lift` directly, introducing a function call to
// retrieve the n-arity transformation.
module.exports = function extend(transform) {
    return function() {
        var args = arguments;
        return this.lift(function() {
            return transform.apply(null, args);
        });
    }
}
