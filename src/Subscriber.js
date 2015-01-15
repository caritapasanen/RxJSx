
var Disposable = require('rx/Disposable'),
    inherits = require('util').inherits, f;

inherits(Subscriber, Disposable);

function Subscriber(onNext, onError, onCompleted) {
    this._onNext = onNext;
    this._onError = onError;
    this._onCompleted = onCompleted;
    this.stopped = false;
    Disposable.call(this, dispose)
};

module.exports = Subscriber;

Subscriber.create = function(n, e, c) {
    return new Subscriber(n, e, c);
};

Subscriber.prototype.onNext = onNext;
Subscriber.prototype.onError = onError;
Subscriber.prototype.onCompleted = onCompleted;

Subscriber.prototype.create = function(n, e, c) {
    var dest = this;
    return new Subscriber(
        n || function(x) { return dest.onNext(x); },
        e || function(e) { return dest.onError(e); },
        c || function( ) { return dest.onCompleted(); }
    );
};

/**
 * Return false to signal unsubscribe.
 */ 
function onNext(x) {
    return !(this.disposed || this.stopped) && (
        (f = this._onNext) && (f = f(x)) || !(f === false));
}

/**
 * Return false to signal a successful unsubscribe.
 */
function onError(e) {
    return !(this.disposed || this.stopped) && (this.stopped = true) &&
        (f = this._onError) && ((f = f(e)) || (f === void 0)) && this.dispose() && false;
}

/**
 * Return false to signal a successful unsubscribe.
 */
function onCompleted() {
    return !(this.disposed || this.stopped) && (this.stopped = true) &&
        (f = this._onCompleted) && ((f = f()) || (f === void 0)) && this.dispose() && false;
}

function dispose() {
    this.stopped = true;
    delete this._onNext;
    delete this._onError;
    delete this._onCompleted;
}
