function Rx() {}

Rx.Observable = require('./Observable');
Rx.Subscriber = require('./Subscriber');

var extend = Rx.Observable.extend,
    prototype = Rx.Observable.prototype;

prototype.let       =        require('./operators/let');
prototype.map       = extend(require('./operators/map'));
prototype.filter    = extend(require('./operators/filter'));
prototype.scan      = extend(require('./operators/scan'));
prototype.toArray   = extend(require('./operators/toArray'));
prototype.mergeAll  = extend(require('./operators/mergeAll'));
prototype.concatAll = extend(require('./operators/concatAll'));

module.exports = Rx;
