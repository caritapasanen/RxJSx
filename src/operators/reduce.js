var scan = require('rx/operators/scan');
module.exports = function reduce(dest, project, acc) {
    var val = dest;
    return scan(dest.create(
            function(x) { return (val = x) && true || true; },
            function(e) { return dest.onError(e); },
            function( ) { return (val === dest || dest.onNext(val)) && dest.onCompleted(); }
        ), project, acc);
}