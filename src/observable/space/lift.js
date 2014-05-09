var Observable = require('../../Observable');

function subscribe(destination) {
    return this.source._subscribe(this.transform(destination));
}

module.exports = function spaceLift(transform) {
    var observable = new Observable(subscribe);
    observable.source = this;
    observable.transform = transform;
    return observable;
};
