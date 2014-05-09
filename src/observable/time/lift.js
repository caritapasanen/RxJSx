var Observable = require('../../Observable');

module.exports = function timeLift(transform) {
    var source = this;
    return new Observable(function subscribe(destination) {
        return source.subscribe(transform(destination));
    });
};