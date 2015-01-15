
module.exports = function take(dest, total) {
    var counter = -1;
    return (total > 0) && dest.create(function(x) {
        if(++counter < total) {
            return dest.onNext(x);
        } else {
            return dest.onCompleted();
        }
    }) || dest.onCompleted();
}