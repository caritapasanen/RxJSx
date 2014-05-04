
module.exports = function scan(seedOrProjection, project) {
    var onNext = this.onNext.bind(this),
        onCompleted = this.onCompleted.bind(this),
        
        hasValue = false,
        hasSeed = typeof project === 'function',
        acc = seedOrProjection,
        project = project || seedOrProjection;
    
    return this.lift({
        _onNext: function(x) {
            if(hasValue || (hasValue = hasSeed)) {
                onNext(acc = project(acc, x));
            } else {
                hasValue = true;
                onNext(acc = x);
            }
        },
        _onCompleted: function() {
            if(!hasValue && hasSeed) {
                onNext(acc);
            }
            onCompleted();
        }
    });
};