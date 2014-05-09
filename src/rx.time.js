var Rx = require('./rx');

Rx.Observable.prototype.lift = require('./observable/time/lift');
// Rx.Subscriber.prototype.lift = require('./subscriber/time/lift');

module.exports = Rx;