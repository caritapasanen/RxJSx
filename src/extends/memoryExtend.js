var Rx = require('../rx'),
    create = require('../support/create'),
    subscriberCreate = Rx.Subscriber.create;

// An implementation of `extend` that inlines `memoryLift` to skip the extra
// function invocation incurred when using `extend` and `memoryLift`.
module.exports = function memoryExtend(transform) {
    return function() {
        return create(this, {
            source: this,
            getSubscriber: transform.apply(null, arguments),
            subscribe: function(subscriber) {
                subscriber = (subscriber && typeof subscriber === 'object') ?
                    subscriber : subscriberCreate.apply(null, arguments);
                return this.source.subscribe(create(subscriber, this.getSubscriber(subscriber)));
            }
        });
    }
}