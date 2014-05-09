var Subscriber = require('../../Subscriber');

function _onNext(x) {
    this.destination.onNext(x);
};
function _onError(e) {
    this.destination.onError(e);
};
function _onCompleted() {
    this.destination.onCompleted()
};

module.exports = function lift(upstream) {
    var proxy = proxy = new Subscriber(_onNext, _onError, _onCompleted);
    proxy.destination = this;
    if(upstream._onNext) {
        proxy._onNext = upstream._onNext;
    }
    if(upstream._onError) {
        proxy._onError = upstream._onError;
    }
    if(upstream._onCompleted) {
        proxy._onCompleted = upstream._onCompleted;
    }
    return proxy;
}