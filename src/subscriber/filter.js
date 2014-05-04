module.exports = function filter(selector) {
    var onNext = this.onNext.bind(this);
    return {
        _onNext: function(x) {
            if(selector(x)) {
                onNext(x);
            }
        }
    };
}