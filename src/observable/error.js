var Observable = require('rx/Observable'),
    inherits = require('util').inherits,
    staticEmpty;

inherits(ErrorObservable, Observable);

function ErrorObservable(error, scheduler) {
    this.error = error;
    this.scheduler = scheduler;
    return Observable.call(this, subscribe);
}

function subscribe(s, state) {
    var scheduler = state ? null : this.scheduler,
        subscriber = state ? state.subscriber : s;
    if(scheduler) {
        this.subscriber = subscriber;
        return scheduler.schedule(this, subscribe);
    }
    subscriber.onError(state.error);
}

module.exports = function error(error, scheduler) {
    return new ErrorObservable(error, scheduler);
}