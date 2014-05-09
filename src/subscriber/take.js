
module.exports = function take(total) {
    
    var onNext = this.onNext.bind(this),
        onCompleted = this.onCompleted.bind(this),
        counter = -1;
    
    if(total <= 0) {
        onCompleted();
        return;
    }
    
    return this.extend(function(x) {
        if(++counter < total) {
            onNext(x);
        } else {
            onCompleted();
        }
    });
}