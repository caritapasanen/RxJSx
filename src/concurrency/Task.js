
var Disposable = require('rx/Disposable'),
    Immediate = require('rx/support/immediate'),
    inherits = require('util').inherits;

inherits(Task, Disposable);

function Task(scheduler, work, time, state, compare) {
    var task = this;
    task._scheduler = scheduler;
    task._work = work;
    task._time = time;
    task._state = state;
    task._compare = compare;
    task._invoked = false;
    return Disposable.call(task, function() {
        task._scheduler = undefined;
        task._work = undefined;
        task._time = undefined;
        task._state = undefined;
        task._compare = undefined;
        task._invoked = undefined;
        task.disposed = true;
    });
};

Task.prototype.compareTo = function(other) {
    return this._compare(this._time, other._time);
}

inherits(Microtask, Task);

function Microtask() {
    return Task.apply(this, arguments);
};

Microtask.prototype.invoke = invokeMicrotask;

function invokeMicrotask() {
    if(this.disposed === false) {
        
        var sched = this._scheduler,
            time = this._time,
            d;
        
        while(time - sched.now() > 0) {
            // block -- microtasks are synchronous
        }
        
        this._invoked = true;
        // Probably don't have to check disposed here, but maybe
        // if we run microtasks on Web Workers or separate node
        // processes? Need to investigate.
        // if(this.disposed === false) {
        return (d = this._work(sched, this._state)) ?
            d.add(this) :
            this.dispose();
        // }
    }
    return this;
};

inherits(Macrotask, Task);

function Macrotask() {
    return Task.apply(this, arguments);
}

Macrotask.prototype.invoke = invokeMacrotask;

function invokeMacrotask() {
    
    if(this.disposed === true) {
        return this;
    }
    
    var task    = this,
        time    = task._time,
        sched   = task._scheduler,
        delta   = time - sched.now(),
        invoked = task._invoked,
        clear, id, d;
    
    if(invoked === false) {
        if(delta <= 0) {
            clear = Immediate.clearImmediate;
            id = Immediate.setImmediate(execute);
        } else {
            clear = clearTimeout;
            id = setTimeout(execute, delta);
        }
        task._id = id;
        task._clear = clear;
        task._invoked = true;
    } else if(delta <= 0) {
        execute();
    }
    
    return task.add(Disposable.create(function() {
        if(id || (id = task._id)) {
            task._id = undefined;
            task._clear(id);
        }
    }));
    
    function execute() {
        id = task._id;
        task._id = undefined;
        task._clear(id);
        if(task.disposed === false) {
            return (d = task._work(sched, task._state)) &&
                d.add(task) ||
                task.dispose();
        }
    }
};

module.exports = {
    Task: Task,
    Microtask: Microtask,
    Macrotask: Macrotask
};