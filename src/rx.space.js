var Rx = require('./rx');

Rx.Observable.prototype.lift = require('./observable/space/lift');
// Rx.Subscriber.prototype.lift = require('./subscriber/space/lift');

module.exports = Rx;