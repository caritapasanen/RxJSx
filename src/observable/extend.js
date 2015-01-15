module.exports = function extend(transform) {
    return function() {
        var args = [], i = -1, n = arguments.length;
        while(++i < n) { args[i + 1] = arguments[i]; }
        return this.lift(function(destination) {
            return transform.apply(destination, (args[0] = destination) && args);
        });
    };
};