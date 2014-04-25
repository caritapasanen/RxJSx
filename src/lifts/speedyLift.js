var Rx = require('../rx'),
    create = require('../support/create'),
    subscriberCreate = Rx.Subscriber.create;

module.exports = function speedyLift(transform) {
    var source = this;
    return create(this, {
        _subscribe: function subscribe(destination) {
            return source.subscribe(transform(destination));
        }
    });
};
