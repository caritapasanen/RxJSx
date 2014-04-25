var Rx = require('./rx'),
    subscriber = Rx.Subscriber.create(
        function(i) {
            console.log(i);
        },
        function(e) {
            console.error('error:', e);
        },
        function() {
            console.log('finished.');
        });

var values = Rx.Observable.create(function(subscriber) {
        subscriber.onNext({value: 1});
        subscriber.onNext({value: 2});
        subscriber.onNext({value: 3});
        subscriber.onCompleted();
    }),
    valuesMap = values.map(function(x) {
        return JSON.stringify(x);
    }),
    valuesFilter = values.filter(function(x) {
        return x.value % 2 !== 0;
    }),
    valuesScan = values.scan({value: 10}, function(acc, x) {
        return { value: acc.value + x.value };
    }),
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
    })

values.subscribe(subscriber);
valuesMap.subscribe(subscriber);
valuesFilter.subscribe(subscriber);
valuesScan.subscribe(subscriber);
valuesScanMap.subscribe(subscriber);
valuesScanFilter.subscribe(subscriber);
valuesScanFilterMap.subscribe(subscriber);
valuesLetScan.subscribe(subscriber);
