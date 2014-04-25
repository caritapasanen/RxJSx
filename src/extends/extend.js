var Rx = require('../rx'),
    create = require('../support/create'),
    subscriberCreate = Rx.Subscriber.create;

module.exports = function extend(transform) {
    return function() {
        var args = arguments;
        return this.lift(function(destination) {
            return transform.apply(destination, args);
        });
    }
}