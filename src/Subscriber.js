var Disposable = require('./Disposable'),
    extend = require('./support/extend');

function Subscriber(onNext, onError, onCompleted) {
    this.disposed = false;
    this.stopped = false;
    
    this._onNext = onNext;
    this._onError = onError;
    this._onCompleted = onCompleted;
    
    return Disposable.call(this);
};

Subscriber.create = function(onNext, onError, onCompleted) {
    return new Subscriber(onNext, onError, onCompleted);
};

Subscriber.prototype.lift = function(upstream) {
    return Subscriber.call(extend(this, upstream));
};

Subscriber.prototype.onNext = function(value) {
    if(this.stopped === false) {
        try {
            if(typeof this._onNext !== 'undefined') {
                this._onNext(value);
            }
        } catch(e) {
            this.onError(e);
        }
    }
}

Subscriber.prototype.onError = function(error) {
    if(this.stopped === false) {
        this.stopped = true;
        try {
            if(typeof this._onError !== 'undefined') {
                this._onError(error);
            }
        } catch(e) {
            throw e;
        } finally {
            this.dispose();
        }
    }
}

Subscriber.prototype.onCompleted = function() {
    if(this.stopped === false) {
        this.stopped = true;
        try {
            if(typeof this._onCompleted !== 'undefined') {
                this._onCompleted();
            }
        } catch(e) {
            throw e;
        } finally {
            this.dispose();
        }
    }
}

Subscriber.prototype.activate = function() {
    this.stopped = false;
    return this;
}

var dispose = Disposable.prototype.dispose;
Subscriber.prototype.dispose = function() {
    if(this.disposed === false) {
        this.stopped = true;
        this.disposed = true;
        try {
            dispose.call(this);
        } catch(e) {
            throw e;
        }
    }
    return this;
};
Subscriber.prototype.add = Disposable.prototype.add;
Subscriber.prototype.remove = Disposable.prototype.remove;

Subscriber.prototype.toImmutable = function() {
    return new Subscriber(
        this.onNext,
        this.onError,
        this.sonCompleted
    );
}

Subscriber.prototype.toMutable = function() {
    return new MutableSubscriber(
        this.onNext,
        this.onError,
        this.onCompleted
    );
}

MutableSubscriber.prototype = new Subscriber();

function MutableSubscriber() {
    Subscriber.apply(this, arguments);
};

MutableSubscriber.prototype.lift = function(overrides) {
    if(overrides.onNext) {
        this._onNext = overrides.onNext;
    }
    if(overrides.onError) {
        this._onError = overrides.onError;
    }
    if(overrides.onCompleted) {
        this._onCompleted = overrides.onCompleted;
    }
    return this;
};

module.exports = Subscriber;