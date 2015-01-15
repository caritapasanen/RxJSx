
module.exports = function toArray(dest) {
    var buffer = [];
    return dest.create(
        function(x) { buffer.push(x); },
        function(e) { return dest.onError(e); },
        function() {
            return dest.onNext(buffer) && dest.onCompleted();
        }
    );
}