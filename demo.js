
var Rx = require('rx/rx');

function onNext(x) {
    console.log(x.value, x.interval + "ms");
}

function onError(e) {
    console.error('error:', e.stack ? e.stack : e);
}

function onCompleted() {
    console.log("");
}

function sum(x, y) {
    return x + y;
}

function add1(x) {
    return x + 1;
}

function even(x) {
    return x % 2 === 0;
}

if(true) {
    var n = 1000000, i = -1, a = Array(n);
    while(++i < n) {
        a[i] = i;
    }
    if(true) {
        console.log("fromArray", n);
        Rx.Observable
            .fromArray(a)
            .filter(even)
            .map(add1)
            .reduce(sum, 0)
            .timeInterval()
            .subscribe(onNext, onError, onCompleted);
    }
    
    if(true) {
        console.log("interval", n);
        Rx.Observable
            .interval(0)
            .take(n)
            .filter(even)
            .map(add1)
            .reduce(sum, 0)
            .timeInterval()
            .subscribe(onNext, onError, onCompleted);
    }
}

if(true) {
    // flatMapping n streams, each containing m items.
    // Results in a single stream that merges in n x m items
    // In Array parlance: Take an Array containing n Arrays, each of length m,
    // and flatten it to an Array of length n x m.
    var n = 1000, m = 1000;
    var a = build(m, n);
    
    function build(m, n) {
        var a = new Array(n);
        for(var i = 0; i< a.length; ++i) {
            a[i] = buildArray(m);
        }
        return a;
    }
    
    function buildArray(n) {
        var a = new Array(n);
        for(var i = 0; i< a.length; ++i) {
            a[i] = i;
        }
        return a;
    }
    
    if(true) {
        console.log("flatMap fromArray", n, "x", m)
        Rx.Observable
            .fromArray(a)
            .flatMap(Rx.Observable.fromArray)
            .reduce(sum, 0)
            .timeInterval()
            .subscribe(onNext, onError, onCompleted);
    }
    
    if(true) {
        console.log("flatMap interval", n, "x", m)
        Rx.Observable
            .interval(0)
            .take(n)
            .flatMap(function(i) {
                i *= 1000;
                return Rx.Observable
                    .interval(0)
                    .take(m);
            })
            .reduce(sum, 0)
            .timeInterval()
            .subscribe(onNext, onError, onCompleted);
    }
}
