var Subscriber = require('../../Subscriber');

module.exports = function lift(upstream) {
    return new Subscriber(upstream._onNext, upstream._onError, upstream._onCompleted);
}