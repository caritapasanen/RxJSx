module.exports = function map(project) {
    return function(destination) {
        return {
            onNext: function(x) {
                return destination.onNext(project(x));
            }
        };
    };
};