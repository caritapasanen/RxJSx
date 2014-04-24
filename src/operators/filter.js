var Rx = require('../rx');
module.exports = Rx.Observable.extend(function filter(selector) {
    return function(destination) {
        return {
            onNext: function(x) {
                if(selector(x)) {
                    return destination.onNext(x);
                }
            }
        }
    }
});
