
module.exports = function toArray() {
    var onNext = this.onNext.bind(this),
        onCompleted = this.onCompleted.bind(this),
        buffer = [];
    return this.extend(
        function(x) {
            buffer.push(x);
        },
        null,
        function() {
            onNext(buffer);
            onCompleted();
        }
    );
}