module.exports = function filter(selector) {
    var onNext = this.onNext.bind(this);
    return this.extend(function(x) {
        if(selector(x)) {
            onNext(x);
        }
    });
}