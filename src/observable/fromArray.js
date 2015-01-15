
var Observable = require('rx/Observable'),
    inherits = require('util').inherits;

inherits(FromArrayObservable, Observable);

function FromArrayObservable(array, scheduler) {
    this.array = array;
    this.scheduler = scheduler;
    return Observable.call(this, subscribe);
}

function subscribe(schedulerOrSubscriber, state) {
    
    var scheduler = state && schedulerOrSubscriber || undefined,
        subscriber = state && state[0] || schedulerOrSubscriber,
        i = state && ++state[1] || -1,
        array = state && state[2] || this.array,
        n = array.length;
    
    if(scheduler) {
        if(i < n) {
            return subscriber.onNext(array[i]) && scheduler.schedule(state, subscribe);
        } else {
            return subscriber.onCompleted();
        }
    } else if(scheduler = this.scheduler) {
        return !subscriber.disposed && scheduler.schedule([subscriber, i, array], subscribe);
    } else {
        while((++i < n) && subscriber.onNext(array[i])) {}
        return subscriber.onCompleted();
    }
}

module.exports = function fromArray(array, scheduler) {
    return new FromArrayObservable(array, scheduler);
}
