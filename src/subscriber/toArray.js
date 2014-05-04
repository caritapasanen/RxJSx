module.exports = function toArray() {
    var onNext = this.onNext.bind(this),
        onCompleted = this.onCompleted.bind(this),
        buffer = [];
    return {
        _onNext: function(x) {
            buffer.push(x);
        },
        _onCompleted: function() {
            onNext(buffer);
            onCompleted();
        }
    };
}