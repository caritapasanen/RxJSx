module.exports = function extend(transform) {
    return function() {
        var args = arguments;
        return this.lift(function(destination) {
            return transform.apply(destination, args);
        });
    };
};