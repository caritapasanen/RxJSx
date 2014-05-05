var Disposable = require('./Disposable'),
    Actions = require('./concurrency/Actions'),
    PriorityQueue = require('./concurrency/PriorityQueue'),
    ObjectPool = require('./concurrency/ObjectPool'),
    
    compare = require('./support/compare'),
    extend = require('./support/extend'),
    
    MicrotaskAction = Actions.MicrotaskAction,
    MacrotaskAction = Actions.MacrotaskAction,
    disposableEmpty = Disposable.E;

module.exports = Scheduler;

Scheduler.prototype = extend({}, Disposable.prototype);

// we want to treat macrotasks like microtasks by default,
// which means we'll attempt to process scheduled macrotasks
// in the current execution of the event loop if we have time.
// 
// if this is set to true, the Scheduler schedules all new
// tasks to execute in the context of the next event loop.
// 
Scheduler.prototype.async = false;
// the time in milliseconds that signals that we should
// yield executing the current macrotask queue.
Scheduler.prototype.frametime = 16/*ms*/;
Scheduler.prototype.now = now;
Scheduler.prototype.compare = compare;
Scheduler.prototype.schedule = schedule;
Scheduler.prototype.getWorker = getWorker;

// define -shared- default macro/microtask factories.
// these happen to be object pools too. what a happy accident.
Scheduler.prototype.macrotaskFactory = new ObjectPool(
    createMacrotask, recycleMacrotask, disposeOf
);
Scheduler.prototype.microtaskFactory = new ObjectPool(
    createMicrotask, recycleMicrotask, disposeOf
);
Scheduler.prototype.workerFactory = new ObjectPool(
    createMicrotaskWorker, recycleMicrotaskWorker, disposeOf
);

Scheduler.now = now;

// define -shared- default macro/microtask priority queues.
Scheduler.macrotaskQueue = new PriorityQueue();
Scheduler.pendingMacrotaskQueue = new PriorityQueue();
Scheduler.microtaskQueue = new PriorityQueue();

MicrotaskScheduler.prototype = extend({}, Scheduler.prototype);
MicrotaskScheduler.prototype.workerFactory = new ObjectPool(
    createWorker, recycleWorker, disposeOf
);

// share the Scheduler's macro/microtask queues with the
// MicrotaskScheduler, so that tasks scheduled explicitly
// as microtasks are interwoven with the scheduler's task
// processing routine.
MicrotaskScheduler.macrotaskQueue = Scheduler.macrotaskQueue;
MicrotaskScheduler.pendingMacrotaskQueue = Scheduler.pendingMacrotaskQueue;
MicrotaskScheduler.microtaskQueue = Scheduler.microtaskQueue;

// Scheduler/MicrotaskScheduler singletons.
Scheduler.instance  = new Scheduler();
Scheduler.microtask = MicrotaskScheduler.instance = new MicrotaskScheduler();

// place a schedule method onto the Scheduler constructor
// so the default scheduler is a little easier to access.
Scheduler.schedule  = schedule.bind(Scheduler.instance);

function Scheduler(opts) {
    
    if(opts == null) {
        opts = Scheduler;
    }
    
    var async = opts.async || this.async,
        
        // allow users to customize the macro/microtask and worker
        // factory instances through the constructor. if they don't,
        // fallback to the instances on the prototype.
        macrotaskFactory = opts.macrotaskFactory || this.macrotaskFactory,
        microtaskFactory = opts.microtaskFactory || this.microtaskFactory,
        workerFactory    = opts.workerFactory    || this.workerFactory,
        
        // allow workers to pass in their own macro/microtask
        // queues. fallback to using separate instances if opts
        // doesn't provide a shared one. don't put these on the
        // prototype though, because we don't want workers'
        // execution queues interfering with each other.
        macrotaskQueue = opts.macrotaskQueue || new PriorityQueue(),
        pendingMacrotaskQueue = opts.pendingMacrotaskQueue || new PriorityQueue(),
        microtaskQueue = opts.microtaskQueue || new PriorityQueue();
    
    // assign the values to our immediate instance to
    // optimize the hash-access/proto-walk time.
    this.async = async;
    this.macrotaskFactory   = macrotaskFactory;
    this.microtaskFactory   = microtaskFactory;
    this.workerFactory      = workerFactory;
    this.macrotaskQueue = macrotaskQueue;
    this.microtaskQueue = microtaskQueue;
    this.pendingMacrotaskQueue = pendingMacrotaskQueue;
    
    return Disposable.call(this);
}

function MicrotaskScheduler() {
    return Scheduler.apply(this, MicrotaskScheduler);
}

// 
// schedules a piece of work to be executed. respects
// the scheduler's `async` flag, which specifies whether
// tasks scheduled outside of a macrotask/microtask
// queue processing context immediately start processing
// the macrotask queue, or if we request an event-loop
// from the JS engine and batch scheduled tasks until
// the requested loop executes.
// 
// schedule something immediately by specifying:
// `delay <= 0` or
// `delay === Scheduler.now` or
// `delay === scheduler.now` or
// `typeof delay !== 'number'
// 
// like so:
// scheduler.schedule(Scheduler.now, stateObj, function workFunc() {
//     etc...;
// });
// 
// schedule something to execute in the future
// by specifying any unsigned numeric value as
// the delay, like so:
// 
// scheduler.schedule(100, stateObj, function workFunc() {
//     etc...;
// });
// 
function schedule(delay, state, work) {
    
    if(this.disposed === true) {
        return disposableEmpty;
    }
    
    var compare = this.compare,
        now     = this.now(),
        argsLen = arguments.length,
        queue, taskFactory, task,
        delayType;
    
    if(delay === Scheduler.now || delay === this.now) {
        delay = 0;
    }
    
    // schedule this worker function immediately with no state.
    if(argsLen === 1) {
        work = delay;
        state = null;
        delay = 0;
    }
    // schedule this worker function immediately with state.
    else if(argsLen === 2) {
        work = state;
        state = delay;
        delay = 0;
    }
    
    // 
    // If the delay is greater than zero, get a macrotask from
    // the pool and immediately invoke it, which invokes setTimeout,
    // or something similar. Add it to the macrotask queue though
    // just in case the native setTimeout is pushed back. If our
    // macrotask queue processor gets to the macrotask before
    // setTimeout has a chance to, we'll execute it instead of
    // waiting on setTimeout to get around to it.
    // 
    if(delay > 0) {
        // put it in the currently-processing macrotasks queue if
        // we have one, otherwise default to putting it in the
        // macrotask queue we'll process in the future.
        return (queue = this.macrotasks || this.macrotaskQueue)
            .enqueue(task = (taskFactory = this.macrotaskFactory)
                .request(this, work, now + delay, state, compare))
            .add(disposeAction)
            .invoke();
    }
    
    // 
    // If the delay is 0 or less, we want to invoke the tasks ASAP
    // without busting our frametime cap.
    // 
    // If we're waiting to process the macrotask queue, queueing the
    // tasks will ensure it gets executed when the JS engine invokes
    // our setImmediate callback.
    // 
    // If we're processing the current macrotask queue, the queue will
    // have been reset to a new queue, which we'll conditionally process
    // if we have time left in the loop after processing microtasks.
    // 
    // If we have a microtask queue without a macrotask queue, we should
    // append the current immediate task to the microtask queue, no questions asked.
    // 
    if(queue = (this.macrotasks || this.microtasks)) {
        return queue
            .enqueue(task = (taskFactory = this.microtaskFactory)
                .request(this, work, now, state, compare))
            .add(disposeAction);
    }
    
    (queue = this.macrotasks = this.macrotaskQueue)
        .enqueue(task = (taskFactory = this.microtaskFactory)
            .request(this, work, now, state, compare))
        .add(disposeAction);
    
    return scheduleExecutionContext(this);
    
    function disposeAction() {
        queue.remove(task);
        taskFactory.release(task);
    }
}

function scheduleExecutionContext(scheduler, taskFactory, task) {
    return (task = (taskFactory = (taskFactory || scheduler.async ?
            scheduler.macrotaskFactory :
            scheduler.microtaskFactory))
    .request(scheduler, executeContext, scheduler.now(), null, scheduler.compare))
    .add(taskFactory.release.bind(taskFactory, task))
    .invoke();
}

function executeContext(scheduler, state) {
    
    var start = scheduler.now(), frametime = scheduler.frametime;
    
    while(executeMacrotasks(scheduler, start, frametime) && executeMicrotasks(scheduler)) {
        // console.log('frame runtime:', (scheduler.now() - start) + 'ms');
    }
    // console.log('frame runtime:', (scheduler.now() - start) + 'ms');
    
    if(scheduler.disposed === true) {
        // If the scheduler is disposed, run executeMacrotasks
        // to immediately return the pending macrotask to the
        // macrotasks pool.
        if(scheduler.macrotasks) {
            executeMacrotasks(scheduler, start, frametime);
        }
    } else if(scheduler.macrotasks) {
        executeMicrotasks(scheduler);
        // If the scheduler isn't disposed, but we have pending
        // macrotasks, request a new event-loop so we can pick up
        // the macrotasks where we left off later.
        return scheduleExecutionContext(scheduler, scheduler.macrotaskFactory);
    }
}

function executeMacrotasks(scheduler, start, frametime) {
    
    var disposed = scheduler.disposed,
        microQ   = scheduler.microtasks,
        macroQ   = scheduler.macrotasks,
        macroF   = scheduler.macrotaskFactory,
        flushed  = true;
    
    if(macroQ) {
        
        scheduler.macrotasks = scheduler.pendingMacrotaskQueue;
        scheduler.microtasks = disposed ? null : this.microtaskQueue;
        
        try {
            while(macroQ.length > 0) {
                if((disposed || (disposed = scheduler.disposed)) === true) {
                    macroF.release(macroQ.dequeue());
                } else if((scheduler.now() - start) >= frametime) {
                    // break if we've been in the loop longer than the scheduler requested.
                    flushed = false;
                    break;
                } else {
                    macroQ.dequeue().invoke();
                }
            }
        } catch(e) {
            throw e;
        } finally {
            scheduler.microtasks = microQ;
            scheduler.macrotasks = macroQ.append(scheduler.pendingMacrotaskQueue);
            scheduler.pendingMacrotaskQueue.empty();
        }
    }
    
    return flushed === true;
}

function executeMicrotasks(scheduler) {
    
    var disposed = scheduler.disposed,
        macroQ   = scheduler.macrotasks,
        microQ   = scheduler.microtasks,
        microF   = scheduler.microtaskFactory,
        flushed  = macroQ.length <= 0;
    
    if(microQ) {
        try {
            while(microQ.length > 0) {
                if((disposed || (disposed = scheduler.disposed)) === true) {
                    microF.release(microQ.dequeue());
                } else {
                    microQ.dequeue().invoke();
                }
            }
        } catch(e) {
            throw e;
        } finally {
            flushed = macroQ.length <= 0;
        }
    }
    
    scheduler.microtasks = null;
    scheduler.macrotasks = flushed ? null : macroQ;
    
    return (flushed === false) && (disposed || scheduler.disposed) === false;
}

function now() {
    // return 0; // <-- for debugging
    return Date.now();
};

function getWorker() {
    return this.workerFactory.request();
};

function createWorker() {
    return new Scheduler();
};

function createMicrotaskWorker() {
    return new MicrotaskScheduler();
};

function recycleWorker() {
    return Scheduler.call(this);
};

function recycleMicrotaskWorker() {
    return MicrotaskScheduler.call(this);
};

function createMicrotask(scheduler, work, time, state, compare) {
    return new MicrotaskAction(scheduler, work, time, state, compare);
};

function recycleMicrotask(scheduler, work, time, state, compare) {
    return MicrotaskAction.call(this, scheduler, work, time, state, compare);
};

function createMacrotask(scheduler, work, time, state, compare) {
    return new MacrotaskAction(scheduler, work, time, state, compare);
};

function recycleMacrotask(scheduler, work, time, state, compare) {
    return MacrotaskAction.call(this, scheduler, work, time, state, compare);
};

function disposeOf(task) {
    return task.dispose();
};
