var noop = require('./support/noop'),
    spread = require('./support/spread')
    ;

function Subscriber(onNext, onError, onCompleted, disposable) {
    this._onNext = onNext || noop;
    this._onError = onError || noop;
    this._onCompleted = onCompleted || noop;
    
    var disposableType;
    if(disposable != null) {
        if((disposableType = typeof disposable) === 'function') {
            this.disposables = [{dispose:disposable.bind(this)}];
        } else if(disposableType === 'object') {
            this.disposables = spread(disposable);
        }
    }
}

var subscriberCreate = Subscriber.create = function(onNext, onError, onCompleted, disposable) {
    return new Subscriber(onNext, onError, onCompleted, disposable);
};

Subscriber.prototype.clone = function() {
    return subscriberCreate(this._onNext, this._onError, this._onCompleted, this.disposables);
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
        var disposables = this.disposables, i = -1, n;
        if(typeof disposables !== 'undefined') {
            n = disposables.length;
            while(++i < n) {
                disposables[i].dispose();
            }
        }
    } catch(e) {
        throw e;
    } finally {
        this.disposables = undefined;
    }
    return this;
};

Subscriber.prototype.add = function(disposable) {
    var disposables = this.disposables;
    if(typeof disposables === 'undefined') {
        disposables = this.disposables = [];
    }
    disposables.push(disposable);
    return this;
};

Subscriber.prototype.remove = function(disposable) {
    var disposables = this.disposables, i;
    if(typeof disposables !== 'undefined') {
        i = disposables.indexOf(disposable);
        if(i > -1) {
            disposables.splice(i, 1);
        }
        if(disposables.length === 0) {
            this.disposables = undefined;
        }
    }
    return this;
};

module.exports = Subscriber;


/*
SafeSubscriber. I don't think this is necessary, but I'm keeping it here for a minute.

var noop = require('./support/noop'),
    spread = require('./support/spread')
    ;

function Subscriber(onNext, onError, onCompleted, disposable) {
    this._onNext = onNext || noop;
    this._onError = onError || noop;
    this._onCompleted = onCompleted || noop;
    this.disposed = false;
    
    var disposableType;
    if(disposable != null) {
        if((disposableType = typeof disposable) === 'function') {
            this.disposables = [{dispose:disposable.bind(this)}];
        } else if(disposableType === 'object') {
            this.disposables = spread(disposable);
        }
    }
}

var subscriberCreate = Subscriber.create = function(onNext, onError, onCompleted, disposable) {
    return new Subscriber(onNext, onError, onCompleted, disposable);
}

Subscriber.prototype.clone = function() {
    return subscriberCreate(this._onNext, this._onError, this._onCompleted, this.disposables);
}

Subscriber.prototype.onNext = function(value) {
    if(this.disposed === false) {
        try {
            this._onNext(value);
        } catch(e) {
            this.onError(e);
        }
    }
}

Subscriber.prototype.onError = function(error) {
    if(this.disposed === false) {
        try {
            this._onError(error);
        } catch(e) {
            throw e;
        } finally {
            this.dispose();
        }
    }
}

Subscriber.prototype.onCompleted = function() {
    if(this.disposed === false) {
        try {
            this._onCompleted();
        } catch(e) {
            throw e;
        } finally {
            this.dispose();
        }
    }
}

Subscriber.prototype.dispose = function() {
    if(this.disposed === false) {
        this.disposed = true;
        try {
            var disposables = this.disposables, i = -1, n;
            if(typeof disposables !== 'undefined') {
                n = disposables.length;
                while(++i < n) {
                    disposables[i].dispose();
                }
            }
        } catch(e) {
            throw e;
        } finally {
            this.onNext =
            this.onError =
            this.onCompleted = noop;
            this.disposables = undefined;
        }
    }
    return this;
}

Subscriber.prototype.add = function(disposable) {
    if(this.disposed === false) {
        var disposables = this.disposables;
        if(typeof disposables === 'undefined') {
            disposables = this.disposables = [];
        }
        disposables.push(disposable);
    } else {
        disposable.dispose();
    }
    return this;
}

Subscriber.prototype.remove = function(disposable) {
    if(this.disposed === false) {
        var disposables = this.disposables, i;
        if(typeof disposables !== 'undefined') {
            i = disposables.indexOf(disposable);
            if(i > -1) {
                disposables.splice(i, 1);
            }
            if(disposables.length === 0) {
                this.disposables = undefined;
            }
        }
    }
    return this;
}

module.exports = Subscriber;
*/