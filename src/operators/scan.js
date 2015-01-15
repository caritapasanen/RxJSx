
module.exports = function scan(dest, project, acc) {
    var hasValue = false, hasSeed = acc !== void 0;
    return dest.create(
        function(x) {
            if(hasValue || (hasValue = hasSeed)) {
                return dest.onNext(acc = project(acc, x));
            }
            hasValue = true;
            return dest.onNext(acc = x);
        },
        function(e) { return dest.onError(e); },
        function( ) {
            if(!hasValue && hasSeed) {
                dest.onNext(acc);
            }
            return dest.onCompleted();
        }
    );
};