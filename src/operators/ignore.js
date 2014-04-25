var noop = require('../support/noop');
module.exports = function ignore() {
    return function(destination) {
        return {
            onNext: noop,
            onError: destination.onError.bind(destination),
            onCompleted: destination.onCompleted.bind(destination)
        };
    };
};