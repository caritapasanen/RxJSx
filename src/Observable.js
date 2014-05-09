var subscriberCreate = require('./subscriber/create'),
    noop = require('./support/noop');

Observable.prototype.forEach =
Observable.prototype.subscribe = subscribe;

module.exports = Observable;

function Observable(subscribe) {
    this._subscribe = subscribe;
};

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

