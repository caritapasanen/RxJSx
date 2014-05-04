var Observable = require('../Observable'),
    extend = require('../support/extend');

SpaceObservable.prototype = new Observable();

function SpaceObservable(subscribe) {
    return Observable.call(this, subscribe);
};

SpaceObservable.extend = Observable.extend;
SpaceObservable.create = function(subscribe) {
    return new SpaceObservable(subscribe);
};

function subscribe(destination) {
    return this.source._subscribe(this.transform(destination));
}

SpaceObservable.prototype.lift = function lift(transform) {
    return extend(this, {
        source: this,
        transform: transform,
        _subscribe: subscribe
    });
};

Observable.prototype.toSpaceObservable = function() {
    return new SpaceObservable(this._subscribe);
}

module.exports = SpaceObservable;