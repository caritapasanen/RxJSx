
module.exports = function mergeAll(dest, concurrent) {
    
    var buffer = [], upstream;
    
    if(typeof concurrent === 'undefined' || concurrent < 1) {
        concurrent = Number.POSITIVE_INFINITY;
    }
    
    return upstream = dest.create(
        function(x) {
            if(upstream.length > concurrent) {
                buffer.push(x);
            } else {
                var inner = x.subscribe(
                    function(x) { return dest.onNext(x);  },
                    function(e) { return dest.onError(e); },
                    function( ) {
                        if(upstream.remove(inner).length < concurrent) {
                            if(buffer.length > 0) {
                                upstream.onNext(buffer.shift());
                            } else if(upstream.stopped === true && upstream.length === 0) {
                                return dest.onCompleted();
                            }
                        }
                        return true;
                    }
                );
                inner && upstream.add(inner);
            }
        },
        function(e) { return e.onError(e); },
        function( ) {
            upstream.stopped = true;
            if(upstream.length === 0 && buffer.length === 0) {
                return dest.onCompleted();
            }
            return false;
        }
    );
}
