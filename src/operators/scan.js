module.exports = function scan(seedOrProjection, project) {
    
    var onNext = this._onNext.bind(this),
        onCompleted = this._onCompleted.bind(this);
    
    var hasValue = false,
        hasSeed = typeof project !== 'undefined',
        seed = hasSeed ? seedOrProjection : undefined,
        project = hasSeed ? project : seedOrProjection,
        acc = seed;
    
    return this.clone({
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