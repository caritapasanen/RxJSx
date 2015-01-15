
var Disposable = require('rx/Disposable'),
    Subscriber = require('rx/Subscriber'),
    type;

function Observable(subscribe) {
    this._subscribe = subscribe;
}

module.exports = Observable;

Observable.prototype.forEach   = subscribe;
Observable.prototype.subscribe = subscribe;

function subscribe(n, e, c, subscriber) {
    return (
        subscriber = (n && typeof n === 'object') && n || new Subscriber(n, e, c)) && (
        fixDisposable(this._subscribe(subscriber))
    );
}

function fixDisposable(upstream) {
    if((type = typeof upstream) === 'function') {
        upstream = Disposable.create(upstream);
    }
    return upstream;
}
