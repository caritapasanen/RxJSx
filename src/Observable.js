var subscriberCreate = require('./Subscriber').create,
    noop = require('./support/noop');

Observable.E = new Observable(noop);
Observable.empty = empty;
Observable.create = create;

Observable.prototype.forEach = subscribe;
Observable.prototype.subscribe = subscribe;

module.exports = Observable;

Observable.extend = function(transform) {
    return function() {
        var args = arguments;
        return this.lift(function(destination) {
            return transform.apply(destination, args);
        });
    };
};

function Observable(subscribe) {
    this._subscribe = subscribe;
};

function create(subscribe) {
    return new Observable(subscribe);
}

function empty() {
    return E;
}

function just(value) {
    return new Observable(function(subscriber) {
        subscriber.onNext(subscriber);
        subscriber.onCompleted();
    });
}

function subscribe(subscriber) {
    return fixDisposable(subscriber, this._subscribe(
        (subscriber && typeof subscriber === 'object') ?
            subscriber.activate() :
            subscriberCreate.apply(null, arguments)));
};

function fixDisposable(downstream, upstream) {
    if(upstream !== downstream && downstream.disposed === false) {
        var type = upstream && typeof upstream;
        if(type === 'function' || type === 'object') {
            if(upstream.stopped === true) {
                return downstream.dispose();
            }
            return downstream.add(upstream);
        }
    }
    return downstream;
};

