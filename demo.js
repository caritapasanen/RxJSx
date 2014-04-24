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
    });

console.log(1);
values
    .scan({value: 10}, function(acc, x) {
        return { value: acc.value + x.value };
    })
    .filter(function(x) {
        return x.value % 2 != 0;
    })
    .map(function(x) {
        return JSON.stringify(x);
    })
    .subscribe(subscriber);

console.log(2);
values
    .ignore()
    .scan({value: 10}, function(acc, x) {
        return { value: acc.value + x.value };
    })
    .subscribe(subscriber);

function scanner(source) {
    return source.scan({value: 10}, function(acc, x) {
        return { value: acc.value + x.value };
    });
}

console.log(3);
values.let(scanner).subscribe(subscriber);