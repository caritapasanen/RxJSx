var Observable = require('../Observable');

module.exports = function value(value, scheduler) {
    return new Observable(function(subscriber) {
        if(!scheduler) {
            subscriber.onNext(value);
            subscriber.onCompleted();
        } else {
            return scheduler.schedule(dispatch, {
                t: "N",
                v: value,
                s: subscriber
            });
        }
    });
}

function dispatch(state, scheduler) {
    switch(state.t) {
        case "N":
            state.s.onNext(state.v);
            state.t = "C";
            return scheduler.schedule(dispatch, state);
        default:
            state.s.onCompleted();
            break;
    }
}
