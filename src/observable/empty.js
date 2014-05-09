var Observable = require('../Observable'),
    inherits = require('util').inherits,
    staticEmpty;

inherits(EmptyObservable, Observable);

function EmptyObservable(scheduler) {
    this.scheduler = scheduler;
    return Observable.call(this, subscribe);
}

function subscribe(s, state) {
    var scheduler = state ? null : this.scheduler,
        subscriber = state ? state : s;
    return scheduler ?
        scheduler.schedule(subscriber, subscribe) :
        subscriber.onCompleted();
}

function subscribe(s, subscriber) {
    var scheduler;
    if(subscriber || !(scheduler = this.scheduler)) {
        (subscriber || s).onCompleted();
    }
    return scheduler.schedule(s, subscribe);
}

staticEmpty = new EmptyObservable();

module.exports = function empty(scheduler) {
    return scheduler ? new EmptyObservable(scheduler) : staticEmpty;
}
