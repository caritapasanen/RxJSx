module.exports = function timeLift(transform) {
    var source = this;
    return this.create(function(destination) {
        return source.subscribe(transform(destination));
    });
};