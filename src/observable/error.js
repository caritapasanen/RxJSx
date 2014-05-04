var Observable = require('../Observable');
module.exports = function error(error, scheduler) {
    return new Observable(function(subscriber) {
        if(!scheduler) {
            subscriber.onError(error);
        } else {
            return scheduler.schedule(dispatch, {
                e: error,
                s: subscriber
            });
        }
    });
}

function dispatch(state) {
    state.s.onError(state.e);
}