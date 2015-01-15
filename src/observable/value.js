var Observable = require('rx/Observable'),
    Subscriber = require('rx/Subscriber'),
    inherits = require('util').inherits;

inherits(ValueObservable, Observable);

function ValueObservable(value, scheduler) {
    this.value = value;
    this.scheduler = scheduler;
    return Observable.call(this, subscribe);
}

function subscribe(s, state) {
    var scheduler  = state ? s : null,
        subscriber = state ? state.subscriber : s;
    
    if(scheduler) {
        if(state.phase === "N") {
            state.phase = "C";
            if(subscriber.onNext(state.value)) {
                return scheduler.schedule(state, subscribe);
            }
        }
        return subscriber.onCompleted();
    } else if(scheduler = this.scheduler) {
        this.phase = "N";
        this.subscriber = subscriber;
        return !subscriber.disposed && scheduler.schedule(this, subscribe);
    } else {
        return subscriber.onNext(this.value) && subscriber.onCompleted();
    }
}

module.exports = function(value, scheduler) {
    return new ValueObservable(value, scheduler);
};
