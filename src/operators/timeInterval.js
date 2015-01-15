module.exports = function timeInterval(dest) {
    var t = Date.now();
    return dest.create(function(x) {
        return dest.onNext({ interval: Date.now() - t, value: x });
    });
}