var Subscriber = require('./Subscriber'),
    subscriberCreate = Subscriber.create,
    isArray = Array.isArray;

function fixDisposable(downstream, upstream) {
    if(downstream.stopped === true) {
        if(upstream && upstream !== downstream) {
            downstream.add(upstream)
        }
        return downstream.dispose();
    }
    var type = upstream && upstream !== downstream && typeof upstream;
    if(type === 'function' || type === 'object') {
        if(upstream.stopped === true) {
            return downstream.dispose();
        }
        return downstream.add(upstream);
    }
    return downstream;
}

function Observable(subscribe) {
    this._subscribe = subscribe;
}

Observable.create = function(subscribe) {
    return new Observable(subscribe);
};

function subscribe(subscriber) {
    return fixDisposable(subscriber, this._subscribe(subscriber.activate()));
}

Observable.prototype.subscribe = Observable.prototype.forEach = function(subscriber) {
    return subscribe.call(this, (subscriber && typeof subscriber === 'object') ? subscriber : subscriberCreate.apply(null, arguments));
};

module.exports = Observable;