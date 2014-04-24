var Rx = require('../rx'),
    noop = require('../support/noop');
module.exports = Rx.Observable.extend(function ignore() {
    return function(destination) {
        return {
            onNext: noop,
            onError: destination.onError.bind(destination),
            onCompleted: destination.onCompleted.bind(destination)
        }
    }
});