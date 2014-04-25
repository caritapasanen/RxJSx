var Rx = require('./src/rx');

Rx.Observable = require('./src/Observable');
Rx.Subscriber = require('./src/Subscriber');

// Use generic `extend` by default, which uses whichever
// `lift` implementation is on that Observable's prototype.
Rx.Observable.extend = require('./src/extends/extend');
// Import the memory-optimized `extend`.
Rx.Observable.memoryExtend = require('./src/extends/memoryExtend');
// Import the speed-optimized `extend`.
Rx.Observable.speedyExtend = require('./src/extends/speedyExtend');

// Use the memory-optimized `lift` by default.
Rx.Observable.prototype.lift =
Rx.Observable.prototype.memoryLift = require('./src/lifts/memoryLift');

// Import the speed-optimized `lift` for kicks.
Rx.Observable.prototype.speedyLift = require('./src/lifts/speedyLift');

// These operators are implemented in terms of Subscriber, and need to be lifted to the Observable prototype.
Rx.Observable.prototype.map = Rx.Observable.extend(require('./src/operators/map'));
Rx.Observable.prototype.filter = Rx.Observable.extend(require('./src/operators/filter'));
Rx.Observable.prototype.scan = Rx.Observable.extend(require('./src/operators/scan'));
Rx.Observable.prototype.ignore = Rx.Observable.extend(require('./src/operators/ignore'));

// These operators are implemented in terms of bind.
Rx.Observable.prototype.let = require('./src/operators/let');
Rx.Observable.prototype.toMemoryObservable = require('./src/operators/toMemoryObservable');
Rx.Observable.prototype.toSpeedyObservable = require('./src/operators/toSpeedyObservable');

module.exports = Rx;
