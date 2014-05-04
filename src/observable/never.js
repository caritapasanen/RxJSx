var Observable = require('../Observable'),
    noop = require('../support/noop'),
    observableNever = new Observable(noop);

Observable.N = observableNever;
module.exports = function never() {
    return observableNever;
}