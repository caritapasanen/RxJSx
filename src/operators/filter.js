module.exports = function filter(selector) {
    var onNext = this._onNext.bind(this);
    return this.clone({
        _onNext: function(x) {
            if(selector(x)) {
                onNext(x);
            }
        }
    });
}
