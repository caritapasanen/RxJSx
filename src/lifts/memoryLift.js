var Rx = require('../rx'),
    create = require('../support/create'),
    subscriberCreate = Rx.Subscriber.create;

module.exports = function memoryLift(transform) {
    return create(this, {
        source: this,
        getSubscriber: transform(),
        subscribe: function(subscriber) {
            subscriber = (subscriber && typeof subscriber === 'object') ?
                subscriber : subscriberCreate.apply(null, arguments);
            return this.source.subscribe(create(subscriber, this.getSubscriber(subscriber)));
        }
    });
}
