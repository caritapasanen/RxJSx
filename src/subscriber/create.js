var Subscriber = require('../Subscriber');
module.exports = function create(onNext, onError, onCompleted) {
    return new Subscriber(onNext, onError, onCompleted);
};