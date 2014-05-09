var Observable = require('../Observable'),
    inherits = require('util').inherits;

inherits(FromArrayObservable, Observable);

function FromArrayObservable(array, scheduler) {
    this.array = array;
    this.scheduler = scheduler;
    return Observable.call(this, subscribe);
}

function subscribe(schedulerOrSubscriber, state) {
    var scheduler = state ? schedulerOrSubscriber : undefined,
        subscriber = state ? state[0] : schedulerOrSubscriber,
        i = state ? ++state[1] : -1,
        array = state ? state[2] : this.array;
    
    if(scheduler) {
        if(i < array.length) {
            subscriber.onNext(array[i]);
            return scheduler.schedule(state, subscribe);
        } else {
            subscriber.onCompleted();
        }
    } else if(scheduler = this.scheduler) {
        return scheduler.schedule([subscriber, i, array], subscribe);
    } else {
        for(; ++i < array.length;) {
            subscriber.onNext(array[i]);
        }
        subscriber.onCompleted();
    }
}

module.exports = function fromArray(array, scheduler) {
    return new FromArrayObservable(array, scheduler);
}
