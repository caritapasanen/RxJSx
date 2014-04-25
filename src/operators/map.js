var Rx = require('../rx');
module.exports = Rx.Observable.extend(function map(project) {
    return function(destination) {
        return {
            onNext: function(x) {
                return destination.onNext(project(x));
            }
        }
    }
});