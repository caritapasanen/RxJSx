var Scheduler = require('rx/Scheduler'),
    Observable = require('rx/Observable'),
    inherits = require('util').inherits;

inherits(IntervalObservable, Observable);

function IntervalObservable(period, scheduler) {
    this.period = period;
    this.scheduler = scheduler;
    return Observable.call(this, subscribe);
}

function subscribe(s, state) {
    var scheduler  = state && s || this.scheduler,
        subscriber = state && state.subscriber || s,
        period = state ? state.period : this.period,
        value  = state ? state.value : 0;
    
    if(period <= 0) {
        while(subscriber.onNext(value++)) {}
        return subscriber.onCompleted();
    } else if(state) {
        if(!subscriber.onNext(state.value++)) {
            return subscriber.onCompleted();
        }
    } else {
        state = {
            subscriber: subscriber,
            value: 0,
            period: period
        };
    }
    
    return scheduler.schedule(period, state, subscribe);
}

module.exports = function interval(period, scheduler) {
    return new IntervalObservable(period, scheduler || Scheduler);
}
