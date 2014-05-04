var Disposable = require('./Disposable'),
    Actions = require('./concurrency/Actions'),
    PriorityQueue = require('./concurrency/PriorityQueue'),
    ObjectPool = require('./concurrency/ObjectPool'),
    
    compare = require('./support/compare'),
    extend = require('./support/extend'),
    
    MicrotaskAction = Actions.MicrotaskAction,
    MacrotaskAction = Actions.MacrotaskAction,
    disposableEmpty = Disposable.E,
    
    sharedMacrotaskQueue = new PriorityQueue(),
    sharedPendingMacrotaskQueue = new PriorityQueue(),
    
    sharedMicrotaskQueue = new PriorityQueue();

module.exports = Scheduler;

Scheduler.prototype = extend({}, Disposable.prototype);

Scheduler.prototype.frametime = 16; //ms
Scheduler.prototype.now = now;
Scheduler.prototype.async = false;
Scheduler.prototype.compare = compare;
Scheduler.prototype.schedule = schedule;
Scheduler.prototype.getWorker = getWorker;
Scheduler.prototype.microtaskActions = new ObjectPool(
    createMicrotask,
    recycleMicrotask,
    disposeTask
);
Scheduler.prototype.macrotaskActions = new ObjectPool(
    createMacrotask,
    recycleMacrotask,
    disposeTask
);

// Shim a schedule method onto the Scheduler constructor
// so the default scheduler is a little easier to access.
Scheduler.schedule  = function(x, y, z) {
    return this.instance.schedule(x, y, z);
};

Scheduler.async = false;
Scheduler.createWorker  = createWorker;
Scheduler.recycleWorker = recycleWorker;
Scheduler.instance  = new Scheduler();

MicrotaskScheduler.prototype = extend({}, Scheduler.prototype);
MicrotaskScheduler.async = false;
MicrotaskScheduler.createWorker  = createMicrotaskWorker;
MicrotaskScheduler.recycleWorker = recycleMicrotaskWorker;

MicrotaskScheduler.instance = new MicrotaskScheduler();

Scheduler.microtask = MicrotaskScheduler.instance;

function Scheduler(opts) {
    
    if(opts == null) {
        opts = Scheduler;
    }
    
    var createWorker = opts.createWorker,
        recycleWorker = opts.recycleWorker,
        async = opts.async;
    
    this.async = async || false;
    this.workers = new ObjectPool(createWorker, recycleWorker, disposeTask);
    
    return Disposable.call(this);
}

function MicrotaskScheduler() {
    return Scheduler.apply(this, MicrotaskScheduler);
}

// 
// if something is scheduled for later:
//     schedule a new JS execution context
//     return the scheduled action
// if something is scheduled immediately:
//     check if we have a macrotask or microtask queue
//         put it in the queue
//     else
//         create the macrotask queue
//         schedule a new JS execution context
//             process the task queues
// 

function schedule(work, delay, state) {
    
    if(this.disposed === true) {
        return disposableEmpty;
    }
    
    var compare = this.compare,
        now     = this.now(),
        queue, actions, action;
    
    // 
    // Specify Scheduler.now or schedulerInstance.now for immediate:
    // scheduler.schedule(workFunc, Scheduler.now, stateObj);
    // 
    if(delay === Scheduler.now || delay === this.now) {
        delay = 0;
    } else if(typeof delay !== 'number') {
        state = delay;
        delay = 0;
    }
    
    // 
    // If the delay is greater than zero, get a macrotask from
    // the pool and immediately invoke it. This will invoke a
    // setTimeout. Add it to the macrotask queue, so just in case
    // our macrotask queue processor gets to the macrotask before
    // setTimeout has a chance to.
    // 
    if(delay > 0) {
        return (queue = this.macrotaskQueue || sharedMacrotaskQueue)
            .enqueue(action = (actions = this.macrotaskActions)
                .get(this, work, now + delay, state, compare))
            .add(disposeAction)
            .invoke();
    }
    
    // 
    // If the delay is 0 or less, we want to invoke the action ASAP
    // without busting our frametime cap.
    // 
    // If we're waiting to process the macrotask queue, queueing the
    // action will ensure it gets executed when the JS engine invokes
    // our setImmediate callback.
    // 
    // If we're processing the current macrotask queue, the queue will
    // have been reset to a new queue, which we'll conditionally process
    // if we have time left in the loop after processing microtasks.
    // 
    // If we have a microtask queue without a macrotask queue, we should
    // append the current immediate action to the microtask queue,
    // no questions asked.
    // 
    if(queue = (this.macrotaskQueue || this.microtaskQueue)) {
        return queue
            .enqueue(action = (actions = this.microtaskActions)
                .get(this, work, now, state, compare))
            .add(disposeAction);
    }
    
    (queue = this.macrotaskQueue = sharedMacrotaskQueue)
        .enqueue(action = (actions = this.microtaskActions)
            .get(this, work, now, state, compare))
        .add(disposeAction);
    
    return scheduleExecution(this);
    
    function disposeAction() {
        queue.remove(action);
        actions.put(action);
    }
}

function scheduleExecution(scheduler, actions, action) {
    return (action = (actions = (actions || scheduler.async ?
            scheduler.macrotaskActions :
            scheduler.microtaskActions))
    .get(scheduler, executeTasks, scheduler.now(), null, scheduler.compare))
    .add(actions.put.bind(actions, action))
    .invoke();
}

function executeTasks(state, scheduler) {
    
    var start = scheduler.now(), frametime = scheduler.frametime;
    
    while(executeMacrotasks(scheduler, start, frametime) && executeMicrotasks(scheduler)) {
        console.log('frame runtime:', (scheduler.now() - start) + 'ms');
    }
    console.log('frame runtime:', (scheduler.now() - start) + 'ms');
    
    if(scheduler.disposed === true) {
        // If the scheduler is disposed, run executeMacrotasks
        // to immediately return the pending macrotask actions
        // to the macrotasks object pool.
        if(scheduler.macrotaskQueue) {
            executeMacrotasks(scheduler, start, frametime);
        }
    } else if(scheduler.macrotaskQueue) {
        executeMicrotasks(scheduler);
        // If the scheduler isn't disposed, but we have pending
        // macrotask actions, async schedule an execution so we
        // can re-enter and process the rest of the macrotasks.
        return scheduleExecution(scheduler, scheduler.macrotaskActions);
    }
}

function executeMacrotasks(scheduler, start, frametime) {
    
    var disposed = scheduler.disposed,
        microQ   = scheduler.microtaskQueue,
        macroQ   = scheduler.macrotaskQueue,
        macroA   = scheduler.macrotaskActions,
        flushed  = true;
    
    if(macroQ) {
        
        scheduler.macrotaskQueue = sharedPendingMacrotaskQueue;
        scheduler.microtaskQueue = disposed ? null : sharedMicrotaskQueue;
        
        try {
            while(macroQ.length > 0) {
                if((disposed || (disposed = scheduler.disposed)) === true) {
                    macroA.put(macroQ.dequeue());
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
            scheduler.microtaskQueue = microQ;
            scheduler.macrotaskQueue = macroQ.append(sharedPendingMacrotaskQueue);
            sharedPendingMacrotaskQueue.empty();
        }
    }
    
    return flushed === true;
}

function executeMicrotasks(scheduler) {
    
    var disposed = scheduler.disposed,
        macroQ   = scheduler.macrotaskQueue,
        microQ   = scheduler.microtaskQueue,
        microA   = scheduler.microtaskActions,
        flushed  = macroQ.length <= 0;
    
    if(microQ) {
        try {
            while(microQ.length > 0) {
                if((disposed || (disposed = scheduler.disposed)) === true) {
                    microA.put(microQ.dequeue());
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
    
    scheduler.microtaskQueue = null;
    scheduler.macrotaskQueue = flushed ? null : macroQ;
    
    return (flushed === false) && (disposed || scheduler.disposed) === false;
}

function now() {
    // return 0; // <-- for debugging
    return Date.now();
};

function getWorker() {
    return this.workers.get();
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

function disposeTask(task) {
    return task.dispose();
};
