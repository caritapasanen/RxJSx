var Observable = require('../Observable'),
    observableEmpty = new Observable(completeImmediately);
Observable.E = observableEmpty;

module.exports = function empty(scheduler) {
    return !scheduler ?
        observableEmpty : new Observable(function(subscriber) {
            scheduler.schedule(completeImmediately, subscriber);
        });
}

function completeImmediately(subscriber) {
    subscriber.onCompleted();
}