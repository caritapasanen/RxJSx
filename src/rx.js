function Rx() {}

var Observable = Rx.Observable = require('rx/Observable'),
    Subscriber = Rx.Subscriber = require('rx/Subscriber'),
    Scheduler  = Rx.Scheduler  = require('rx/Scheduler'),
    observableProto = Observable.prototype,
    subscriberProto = Subscriber.prototype;

var extend = Observable.extend = require('rx/observable/extend');

Observable.empty     = require('rx/observable/empty');
Observable.error     = require('rx/observable/error');
Observable.fromArray = require('rx/observable/fromArray');
Observable.interval  = require('rx/observable/interval');
Observable.never     = require('rx/observable/never');
Observable.value     = require('rx/observable/value');
Observable.create = 
observableProto.create       =        require('rx/observable/create');
observableProto.lift         =        require('rx/observable/time-lift');
observableProto.let          =        require('rx/operators/let');
observableProto.map          = extend(require('rx/operators/map'));
observableProto.flatMap      = extend(require('rx/operators/flatMap'));
observableProto.filter       = extend(require('rx/operators/filter'));
observableProto.scan         = extend(require('rx/operators/scan'));
observableProto.reduce       = extend(require('rx/operators/reduce'));
observableProto.take         = extend(require('rx/operators/take'));
observableProto.timeInterval = extend(require('rx/operators/timeInterval'));
observableProto.toArray      = extend(require('rx/operators/toArray'));
observableProto.mergeAll     = extend(require('rx/operators/mergeAll'));
observableProto.concatAll    = extend(require('rx/operators/concatAll'));

module.exports = Rx;
