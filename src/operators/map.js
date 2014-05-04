
module.exports = function map(project) {
    var onNext = this.onNext.bind(this);
    return this.lift({
        _onNext: function(x) {
            return onNext(project(x));
        }
    });
};