var Rx = require('../rx'),
    create = require('../support/create'),
    subscriberCreate = Rx.Subscriber.create;

module.exports = function speedyLift(transform) {
    var source = this,
        getSubscriber = transform();
    return create(this, {
        subscribe: function subscribe(subscriber) {
            subscriber = (subscriber && typeof subscriber === 'object') ?
                subscriber : subscriberCreate.apply(null, arguments);
            return source.subscribe(create(subscriber, getSubscriber(subscriber)));
        }
    });
}
