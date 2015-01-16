
module.exports = function take(dest, total) {
    var counter = -1, upstream;
    return (total > 0) && (upstream = dest.create(function(x) {
        if(++counter < total) {
            return dest.onNext(x);
        } else {
            return upstream.dispose() && dest.onCompleted();
        }
    })) || (this.dispose() && dest.onCompleted());
}