var Scheduler = require('./src/Scheduler');

Scheduler.instance.async = true;

var i = -1;
while(++i < 5) {
    Scheduler.schedule(function(state, scheduler) {
        console.log('scheduled', state);
    }, "hi.");
}

Scheduler.schedule(function(state, scheduler) {
    console.log('scheduled', state);
}, "hi again.");

var t = Date.now();
i = 0;

futureHi(Scheduler);

function futureHi(scheduler) {
    scheduler.schedule(function(state, scheduler) {
        console.log('scheduled', state, 'welcome to ' + (Date.now() - t) + 'ms into the future.');
        while(++i < 5) {
            return futureHi(scheduler);
        }
    }, 1000, "another hi.");
}

console.log("this message should print first if the scheduler is async.");