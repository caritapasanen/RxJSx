module.exports = function map(project) {
    var onNext = this.onNext.bind(this);
    return this.extend(function(x) {
        return onNext(project(x));
    });
};
