
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
 * Return false to signal unsubscribe, true to keep listening.
 */ 
function onNext(x) {
    return (
        // If we don't have an _onNext, return `false`.
        (f = this._onNext || false) &&
        // Capture onNext's return value.
        // 
        // 1. If the return value is not `false`, return whether the
        //    onNext function called dispose or not.
        // 2. If the return value is `false`, dispose of the Subscriber
        //    and return false.
        ((f = f(x) !== false) ? 
            !this.disposed :
            !this.disposed && this.dispose() && false)
    );
}

/**
 * Return false to signal a successful unsubscribe.
 */
function onError(e) {
    return (
        // Return false if we're alraedy stopped.
        (this.stopped === false) &&
        // If we don't have an onError function, return `false`.
        (f = this._onError || false) && (
            // Otherwise, set our stopped flag.
            (this.stopped = true) &&
            // Capture onError's return value.
            // 1. If the return value is not `false`, call dispose and return true.
            // 2. If the return value is `false`, return false.
            (f = f(e) !== false) && (!!this.dispose() || true))
    );
}

/**
 * Return false to signal a successful unsubscribe.
 */
function onCompleted() {
    return (
        // Return false if we're alraedy stopped.
        (this.stopped === false) &&
        // If we don't have an onCompleted function, return `false`.
        (f = this._onCompleted || false) && (
            // Otherwise, set our stopped flag.
            (this.stopped = true) &&
            // Capture onCompleted's return value.
            // 1. If the return value is not `false`, call dispose and return true.
            // 2. If the return value is `false`, return false.
            (f = f() !== false) && (!!this.dispose() || true))
    );
}

function dispose() {
    this.stopped = true;
    delete this._onNext;
    delete this._onError;
    delete this._onCompleted;
}
