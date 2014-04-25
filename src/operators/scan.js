var Rx = require('../rx');
module.exports = Rx.Observable.extend(function scan(accOrProjection, project) {
    var hasSeed = typeof project !== 'undefined',
        acc = hasSeed ? accOrProjection : undefined,
        project = hasSeed ? project : accOrProjection;
    return function(destination) {
        var hasValue = hasSeed;
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
                    destination.onNext(acc);
                }
                destination.onCompleted();
            }
        }
    }
});