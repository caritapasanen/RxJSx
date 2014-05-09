
var Scheduler = require('./src/Scheduler');

// Scheduler.instance.async = true;

Scheduler.schedule({message: "hi", count: 0}, function sayHi(scheduler, state) {
    console.log('scheduled', state.message + '.');
    if(++state.count < 5) {
        state.message += "i";
        return Scheduler.schedule(state, sayHi);
    }
});

Scheduler.schedule("hi again.", function(scheduler, state) {
    console.log('scheduled', state);
});

var startTime = Scheduler.now();

Scheduler.schedule(1000, {message: "hi", count: 0}, function sayFutureHi(scheduler, state) {
    
    console.log(state.message + "!", 'welcome to', (scheduler.now() - startTime) + 'ms into the future.');
    
    if(++state.count < 5) {
        state.message += "i";
        return scheduler.schedule(1000, state, sayFutureHi);
    }
});

console.log("this message should print first if the scheduler is async.");
