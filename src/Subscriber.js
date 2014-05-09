var Disposable = require('./Disposable'),
    disposableDispose = Disposable.prototype.dispose,
    inherits = require('util').inherits;

inherits(Subscriber, Disposable);

Subscriber.create = create;
Subscriber.prototype.onNext = onNext;
Subscriber.prototype.onError = onError;
Subscriber.prototype.onCompleted = onCompleted;
Subscriber.prototype.extend = extendSubscriber;

function Subscriber(onNext, onError, onCompleted) {
    
    this.stopped = false;
    
    this._onNext = onNext;
    this._onError = onError;
    this._onCompleted = onCompleted;
    
    return Disposable.call(this, dispose);
};

function create(a, b, c) {
    return new Subscriber(a, b, c);
}

function extendSubscriber(a, b, c) {
    return new Subscriber(a || this._onNext, b || this._onError, c || this._onCompleted).add(this);
}

function onNext(x) {
    try {
        if(this.stopped === false && this._onNext) {
            this._onNext(x);
        }
    } catch(e) {
        this.onError(e);
    }
}

function onError(e) {
    try {
        this.stopped = true;
        if(this._onError) {
            this._onError(e);
        }
    } catch(e) {
        throw e;
    } finally {
        this.dispose();
    }
}

function onCompleted() {
    try {
        this.stopped = true;
        if(this._onCompleted) {
            this._onCompleted();
        }
    } catch(e) {
        throw e;
    } finally {
        this.dispose();
    }
}

function dispose() {
    if(this.disposed === false) {
        this.stopped = true;
        disposableDispose.call(this);
    }
    return this;
}

module.exports = Subscriber;
