var Rx = require('../rx');
module.exports = Rx.Observable.extend(function scan(seedOrProjection, project) {
    var hasSeed = typeof project !== 'undefined',
        seed = hasSeed ? seedOrProjection : undefined,
        project = hasSeed ? project : seedOrProjection;
    return function(destination) {
        var hasValue = false,
            acc = seed;
        return {
            onNext: function(x) {
                if (hasValue || (hasValue = hasSeed)) {
                    destination.onNext(acc = project(acc, x));
                } else {
                    hasValue = true;
                    destination.onNext(acc = x);
                }
            },
            onCompleted: function() {
                if (!hasValue && hasSeed) {
                    destination.onNext(acc);
                }
                destination.onCompleted();
            }
        }
    }
});