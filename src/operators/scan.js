var Rx = require('../rx');
module.exports = Rx.Observable.extend(function scan(accOrProjection, project) {
    return function(destination) {
        var hasSeed = typeof project !== 'undefined',
            hasValue = hasSeed,
            acc = hasSeed ? accOrProjection : undefined;
        project = hasSeed ? project : accOrProjection;
        return {
            onNext: function(x) {
                if(hasSeed) {
                    hasSeed = false;
                }
                if(hasValue) {
                    destination.onNext(acc = project(acc, x));
                } else {
                    hasValue = true;
                    destination.onNext(acc = x);
                }
            },
            onCompleted: function() {
                if(hasSeed) {
                    hasSeed = false;
                    destination.onNext(acc);
                }
                destination.onCompleted();
            }
        }
    }
})