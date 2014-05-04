var Rx = require('./rx');

function RxSpace() {}

RxSpace.Subscriber = Rx.Subscriber;
RxSpace.Observable = require('./space/Observable');

module.exports = RxSpace;