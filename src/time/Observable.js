var Observable = require('../Observable'),
    extend = require('../support/extend');

TimeObservable.prototype = new Observable();

function TimeObservable(subscribe) {
    return Observable.call(this, subscribe);
};

TimeObservable.extend = Observable.extend;
TimeObservable.create = function(subscribe) {
    return new TimeObservable(subscribe);
};

TimeObservable.prototype.lift = function lift(transform) {
    var source = this;
    return extend(this, {
        _subscribe: function(destination) {
            return source._subscribe(transform(destination));
        }
    });
};

Observable.prototype.toTimeObservable = function() {
    return new TimeObservable(this._subscribe);
}

module.exports = TimeObservable;