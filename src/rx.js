function Rx() {}

var Observable = Rx.Observable = require('./Observable'),
    Subscriber = Rx.Subscriber = require('./Subscriber'),
    Disposable = Rx.Disposable = require('./Disposable'),
    Scheduler = Rx.Scheduler = require('./Scheduler'),
    observableProto  = Rx.Observable.prototype;

var extend = Observable.extend = require('./observable/extend');

Observable.create    = require('./observable/create');
Observable.empty     = require('./observable/empty');
Observable.error     = require('./observable/error');
Observable.never     = require('./observable/never');
Observable.value     = require('./observable/value');
Observable.fromArray = require('./observable/fromArray');

// Subscriber.create = require('./subscriber/create');

observableProto.let  = require('./observable/let');
observableProto.map        = extend(require('./subscriber/map'));
observableProto.filter     = extend(require('./subscriber/filter'));
observableProto.scan       = extend(require('./subscriber/scan'));
observableProto.toArray    = extend(require('./subscriber/toArray'));
observableProto.mergeAll   = extend(require('./subscriber/mergeAll'));
observableProto.concatAll  = extend(require('./subscriber/concatAll'));

module.exports = Rx;
