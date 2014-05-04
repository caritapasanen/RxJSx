
var Rx = require('./src/rx'),
    RxSpace = require('./src/rx.space'),
    RxTime = require('./src/rx.time'),
    subscriber = Rx.Subscriber.create(
        function(i) { console.log(i); },
        function(e) { console.error('error:', e); },
        function()  { }
    );

// demo(RxSpace.Observable.create);
// demo(RxTime.Observable.create );

function getValues(observableCreate) {
    return observableCreate(function(subscriber) {
        subscriber.onNext({value: 1});
        subscriber.onNext({value: 2});
        subscriber.onNext({value: 3});
        subscriber.onCompleted();
        return function dispose() {
            // nothing
        }
    });
}

function getInterval(observableCreate, time) {
    return observableCreate(function(subscriber) {
        
        var i = 0,
            x = setInterval(function() {
                if(++i <= 3) {
                    subscriber.onNext({value: i});
                } else {
                    subscriber.onCompleted();
                }
            }, 100);
        
        return function dispose() {
            clearInterval(x);
        }
    });
}

function demo(observableCreate) {
    // var values = getValues(observableCreate),
    var values = getInterval(observableCreate, 1000),
        valuesMap = values.map(function(x) {
            return JSON.stringify(x);
        }),
        valuesFilter = values.filter(function(x) {
            return x.value % 2 !== 0;
        }),
        valuesScan = values.scan({value: 10}, function(acc, x) {
            return { value: acc.value + x.value };
        }),
        valuesMerge = values.map(function() {
            return values;
        })
        .mergeAll(),
        valuesConcat = values.map(function() {
            return values;
        })
        .concatAll(),
        valuesScanMap = valuesScan.map(function(x) {
            return JSON.stringify(x);
        }),
        valuesScanFilter = valuesScan.filter(function(x) {
            return x.value % 2 !== 0;
        }),
        valuesScanFilterMap = valuesScan
            .filter(function(x) {
                return x.value % 2 !== 0;
            })
            .map(function(x) {
                return JSON.stringify(x);
            }),
        valuesLetScan = values.let(function(source) {
            return source.scan({value: 10}, function(acc, x) {
                return { value: acc.value + x.value };
            });
        });
    
    values              .toArray().subscribe(subscriber);
    valuesMap           .toArray().subscribe(subscriber);
    valuesFilter        .toArray().subscribe(subscriber);
    valuesScan          .toArray().subscribe(subscriber);
    valuesScanMap       .toArray().subscribe(subscriber);
    valuesScanFilter    .toArray().subscribe(subscriber);
    valuesScanFilterMap .toArray().subscribe(subscriber);
    valuesLetScan       .toArray().subscribe(subscriber);
    valuesMerge         .toArray().subscribe(subscriber);
    valuesConcat        .toArray().subscribe(subscriber);
    
    // values              .toArray().subscribe(subscriber.toImmutable());
    // valuesMap           .toArray().subscribe(subscriber.toImmutable());
    // valuesFilter        .toArray().subscribe(subscriber.toImmutable());
    // valuesScan          .toArray().subscribe(subscriber.toImmutable());
    // valuesScanMap       .toArray().subscribe(subscriber.toImmutable());
    // valuesScanFilter    .toArray().subscribe(subscriber.toImmutable());
    // valuesScanFilterMap .toArray().subscribe(subscriber.toImmutable());
    // valuesLetScan       .toArray().subscribe(subscriber.toImmutable());
    // valuesMerge         .toArray().subscribe(subscriber.toImmutable());
    
    // values              .toArray().subscribe(subscriber.toMutable());
    // valuesMap           .toArray().subscribe(subscriber.toMutable());
    // valuesFilter        .toArray().subscribe(subscriber.toMutable());
    // valuesScan          .toArray().subscribe(subscriber.toMutable());
    // valuesScanMap       .toArray().subscribe(subscriber.toMutable());
    // valuesScanFilter    .toArray().subscribe(subscriber.toMutable());
    // valuesScanFilterMap .toArray().subscribe(subscriber.toMutable());
    // valuesLetScan       .toArray().subscribe(subscriber.toMutable());
    // valuesMerge         .toArray().subscribe(subscriber.toMutable());
}
