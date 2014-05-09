var Observable = require('../Observable'),
    inherits = require('util').inherits;

inherits(ValueObservable, Observable);

function ValueObservable(value, scheduler) {
    this.value = value;
    this.scheduler = scheduler;
    return Observable.call(this, subscribe);
}

function subscribe(s, state) {
    var scheduler = state ? s : null,
        subscriber = state ? state.subscriber : s;
    
    if(scheduler) {
        if(state.phase === "N") {
            state.phase = "C";
            subscriber.onNext(state.value);
            return scheduler.schedule(state, subscribe);
        }
        subscriber.onCompleted();
    } else if(scheduler = this.scheduler) {
        this.phase = "N";
        this.subscriber = subscriber;
        return scheduler.schedule(this, subscribe);
    } else {
        subscriber.onNext(this.value);
        subscriber.onCompleted();
    }
}

module.exports = function value(value, scheduler) {
    return new ValueObservable(value, scheduler);
}
