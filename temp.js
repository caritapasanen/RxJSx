
var Scheduler = require('./src/Scheduler');

Scheduler.instance.async = true;

var i = -1;
while(++i < 5) {
    Scheduler.schedule("hi.", function(state, scheduler) {
        console.log('scheduled', state);
    });
}

Scheduler.schedule("hi again.", function(state, scheduler) {
    console.log('scheduled', state);
});

i = 0;

(function futureHi(scheduler, startTime) {
    scheduler.schedule(1000, "another hi.", function(state, scheduler) {
        console.log('scheduled', state, 'welcome to ' + (Date.now() - startTime) + 'ms into the future.');
        while(++i < 5) {
            return futureHi(scheduler, startTime);
        }
    });
})(Scheduler, Date.now());

console.log("this message should print first if the scheduler is async.");
