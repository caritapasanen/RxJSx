var Observable = require('../Observable'),
    inherits = require('util').inherits;

inherits(DeferObservable, Observable);

function DeferObservable(observableFactory) {
    this.factory = observableFactory;
    return Observable.call(this, subscribe);
}

function subscribe(subscriber) {
    return this.factory().subscribe(subscriber);
}

module.exports = function defer(observableFactory) {
    return new DeferObservable(observableFactory);
}