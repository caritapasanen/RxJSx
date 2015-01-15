
function subscribe(destination) {
    return this.source._subscribe(this.transform(destination));
}

module.exports = function spaceLift(transform) {
    var observable = this.create(subscribe);
    observable.source = this;
    observable.transform = transform;
    return observable;
};
