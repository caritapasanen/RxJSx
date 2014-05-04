var Rx = require('./rx');

function RxTime() {}

RxTime.Subscriber = Rx.Subscriber;
RxTime.Observable = require('./time/Observable');

module.exports = RxTime;