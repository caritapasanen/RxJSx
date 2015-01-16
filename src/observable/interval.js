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
    
    var scheduler  = state && s || undefined,
        subscriber = state && state.subscriber || s,
        period = state ? state.period : this.period,
        value  = state ? state.value : -1;
    
    if(scheduler) {
        return subscriber.onNext(state.value = ++value) && scheduler.schedule(period, state, subscribe);
    } else if(scheduler = this.scheduler) {
        return !subscriber.disposed && scheduler.schedule(period, {
            subscriber: subscriber, value: value, period: period
        }, subscribe);
    } else {
        while(subscriber.onNext(++value)) {}
        return false;
    }
}

module.exports = function interval(period, scheduler) {
    return new IntervalObservable(period, (period > 0 || undefined) && (scheduler || Scheduler));
}
