module.exports = function map(project) {
    var onNext = this._onNext;//.bind(this);
    return this.clone({
        _onNext: function(x) {
            return onNext(project(x));
        }
    });
};