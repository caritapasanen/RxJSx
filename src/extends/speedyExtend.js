var Rx = require('../rx'),
    create = require('../support/create'),
    subscriberCreate = Rx.Subscriber.create;

// An implementation of `extend` that inlines `speedyLift` to skip the extra
// function invocation incurred when using `extend` and `speedyLift`.
module.exports = function speedyExtend(transform) {
    return function() {
        var source = this,
            getSubscriber = transform.apply(null, arguments);
        return create(this, {
            subscribe: function(subscriber) {
                subscriber = (subscriber && typeof subscriber === 'object') ?
                    subscriber : subscriberCreate.apply(null, arguments);
                return source.subscribe(create(subscriber, getSubscriber(subscriber)));
            }
        });
    }
}