
module.exports = function map(dest, project) {
    return dest.create(function(x) {
        return dest.onNext(project(x));
    });
};
