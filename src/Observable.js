function fixDisposable(subscriber, disposable) {
    var disposableType;
    if(disposable != null) {
        if((disposableType = typeof disposable) === 'function') {
            return subscriber.add({ dispose: disposable.bind(subscriber) });
        } else if(disposableType === 'object') {
            return subscriber.add(disposable);
        }
    }
    return subscriber;
}

function Observable(subscribe) {
    this._subscribe = subscribe;
}

function subscribe(subscriber) {
    return fixDisposable(subscriber, this._subscribe(subscriber));
}

Observable.create = function(subscribe) {
    return new Observable(subscribe);
};

Observable.prototype.subscribe = Observable.prototype.forEach = function(subscriber) {
    return subscribe.call(this, subscriber);
};

module.exports = Observable;