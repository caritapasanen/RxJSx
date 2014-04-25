var Disposable = require('./Disposable'),
    create = require('./support/create'),
    slice = Array.prototype.slice
    ;

function Subscriber(onNext, onError, onCompleted) {
    this.stopped = false;
    this.disposed = false;
    
    this._onNext = onNext;
    this._onError = onError;
    this._onCompleted = onCompleted;
    this._disposable = Disposable.create();
};

Subscriber.create = function(onNext, onError, onCompleted) {
    return new Subscriber(onNext, onError, onCompleted);
};

Subscriber.prototype.clone = function(overrides) {
    return create(this, overrides);
};

Subscriber.prototype.onNext = function(value) {
    if(this.disposed === false) {
        try {
            if(typeof this._onNext !== 'undefined') {
                this._onNext(value);
            }
        } catch(e) {
            this.onError(e);
        }
    }
};

Subscriber.prototype.onError = function(error) {
    if(this.disposed === false) {
        this.stopped = true;
        try {
            if(typeof this._onError !== 'undefined') {
                this._onError(error);
            }
        } catch(e) {
            throw e;
        }
    }
};

Subscriber.prototype.onCompleted = function() {
    if(this.disposed === false) {
        this.stopped = true;
        try {
            if(typeof this._onCompleted !== 'undefined') {
                this._onCompleted();
            }
        } catch(e) {
            throw e;
        }
    }
};

Subscriber.prototype.activate = function() {
    this.stopped = false;
    this.disposed = false;
    return this;
}

Subscriber.prototype.dispose = function() {
    if(this.disposed === false) {
        this.stopped = true;
        this.disposed = true;
        try {
            this._disposable.dispose();
        } catch(e) {
            throw e;
        }
    }
    return this;
};

Subscriber.prototype.add = function() {
    var disposable = this._disposable;
    disposable.add.apply(disposable, arguments);
    if(this.disposed === true) {
        disposable.dispose();
    }
    return this;
};

Subscriber.prototype.remove = function() {
    var disposable = this._disposable;
    disposable.remove.apply(disposable, arguments);
    return this;
};

module.exports = Subscriber;
