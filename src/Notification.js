var Observable = require('./Observable');

Notification.createOnNext = createOnNext;
Notification.createOnError = createOnError;
Notification.createOnCompleted = createOnCompleted;

Notification.prototype = new Observable();
Notification.prototype.accept = accept;
Notification.prototype.toObservable = toObservable;

function Notification(kind, value, error) {
    this.kind = kind;
    this.value = value;
    this.error = error;
    this.hasValue = hasValue == null ? false : hasValue;
}

function createOnNext(value) {
    return new Notification("N", value);
}

function createOnError(error) {
    return new Notification("E", null, error);
}

function createOnCompleted() {
    return new Notification("C");
}

function accept(subscriber) {
    return subscriber && typeof subscriber === 'object' ?
        acceptSubscriber.call(this, subscriber) :
        acceptCallbacks.apply(this, arguments);
}

function toObservable(scheduler) {
    return new Observable(acceptSubscriber).observeOn(scheduler);
}

function acceptSubscriber(subscriber) {
    switch(this.kind) {
        case "N":
            subscriber.onNext(this.value);
            subscriber.onCompleted();
            break;
        case "E":
            subscriber.onError(this.error);
            break;
        case "C":
            subscriber.onCompleted();
            break;
    }
    return subscriber;
}

function acceptCallbacks(onNext, onError, onCompleted) {
    switch(this.kind) {
        case "N":
            onNext(this.value);
            onCompleted();
            break;
        case "E":
            onError(this.error);
            break;
        case "C":
            onCompleted();
            break;
    }
    return subscriber;
}

module.exports = Notification;