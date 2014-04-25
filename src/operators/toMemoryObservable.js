var Rx = require('../rx'),
    Observable = Rx.Observable,
    inherits = require('util').inherits;

inherits(MemoryObservable, Observable);

function MemoryObservable(subscribe) {
    Observable.call(this, subscribe);
}

var observableCreate = Observable.createMemoryObservable = function(subscribe) {
    return new MemoryObservable(subscribe);
};

MemoryObservable.extend = require('../extends/extend');
MemoryObservable.prototype.lift = require('../lifts/memoryLift');

module.exports = function toMemoryObservable() {
    return observableCreate(this.subscribe);
};