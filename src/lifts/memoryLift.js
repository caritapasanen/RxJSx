var Rx = require('../rx'),
    create = require('../support/create'),
    subscriberCreate = Rx.Subscriber.create;

module.exports = function memoryLift(transform) {
    return create(this, {
        source: this,
        transform: transform,
        _subscribe: function(destination) {
            return this.source.subscribe(this.transform(destination));
        }
    });
};
