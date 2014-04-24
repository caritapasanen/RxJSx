var Rx = require('../rx'),
    Observable = Rx.Observable,
    inherits = require('util').inherits;

inherits(SpeedyObservable, Observable);

function SpeedyObservable(subscribe) {
    Observable.call(this, subscribe);
}

var observableCreate = Observable.createSpeedyObservable = function(subscribe) {
    return new SpeedyObservable(subscribe);
}

SpeedyObservable.extend = require('../extends/speedyExtend');
SpeedyObservable.prototype.lift = require('../lifts/speedyLift');

module.exports = function toSpeedyObservable() {
    return observableCreate(this.subscribe);
}