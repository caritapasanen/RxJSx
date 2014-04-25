var Disposable = require('./Disposable'),
    noop = require('./support/noop'),
    spread = require('./support/spread'),
    slice = Array.prototype.slice
    ;

function Subscriber(onNext, onError, onCompleted) {
    this._onNext = onNext || noop;
    this._onError = onError || noop;
    this._onCompleted = onCompleted || noop;
    
    var disposables = spread(slice.call(arguments, 3));
    
    if(disposables.length > 0) {
        this._disposable = Disposable.create(disposables);
    }
};

Subscriber.create = function(onNext, onError, onCompleted) {
    return new Subscriber(onNext, onError, onCompleted, slice.call(arguments, 3));
};

Subscriber.prototype.onNext = function(value) {
    try {
        this._onNext(value);
    } catch(e) {
        this.onError(e);
    }
};

Subscriber.prototype.onError = function(error) {
    try {
        this._onError(error);
    } catch(e) {
        throw e;
    } finally {
        this.dispose();
    }
};

Subscriber.prototype.onCompleted = function() {
    try {
        this._onCompleted();
    } catch(e) {
        throw e;
    } finally {
        this.dispose();
    }
};

Subscriber.prototype.dispose = function() {
    try {
        var disposable = this._disposable;
        if(typeof disposable !== 'undefined') {
            this._disposable = undefined;
            disposable.dispose();
        }
    } catch(e) {
        throw e;
    } finally {
        this.disposables = undefined;
    }
    return this;
};

Subscriber.prototype.add = function() {
    var disposable = this._disposable;
    if(typeof disposable !== 'undefined') {
        disposable.add.apply(disposable, arguments);
    }
    return this;
};

Subscriber.prototype.remove = function() {
    var disposable = this._disposable;
    if(typeof disposable !== 'undefined') {
        disposable.remove.apply(disposable, arguments);
        if(disposable.length === 0) {
            this._disposable = undefined;
        }
    }
    return this;
};

module.exports = Subscriber;