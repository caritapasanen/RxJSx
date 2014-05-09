var Disposable = require('../Disposable'),
    extend = require('../support/extend')
    Immediate = require('../support/immediate');

Task.prototype = extend(Disposable.prototype);
Task.prototype.compareTo = compareTo;

function Task(scheduler, work, time, state, compare) {
    
    var task = this;
    
    this._scheduler = scheduler;
    this._work = work;
    this._time = time;
    this._state = state;
    this._compare = compare;
    this._invoked = false;
    
    return Disposable.call(this).add(function() {
        delete task._scheduler;
        delete task._work;
        delete task._time;
        delete task._state;
        delete task._compare;
        delete task._invoked;
        delete task._id;
        delete task._clear;
    });
};

function compareTo(other) {
    return this._compare(this._time, other._time);
}

Microtask.prototype = extend(Task.prototype);
Microtask.prototype.invoke = invokeMicrotask;

function Microtask() {
    return Task.apply(this, arguments);
};

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

Macrotask.prototype = extend(Task.prototype);
Macrotask.prototype.invoke = invokeMacrotask;

function Macrotask() {
    return Task.apply(this, arguments);
};

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
    
    return task.add(dispose);
    
    function execute() {
        id = task._id;
        task._id = undefined;
        task._clear(id);
        if(task.disposed === false) {
            return (d = task._work(sched, task._state)) ?
                d.add(task) :
                task.dispose();
        }
    }
    function dispose() {
        if(id = task._id) {
            task._id = undefined;
            task._clear(id);
        }
    }
};

module.exports = {
    Task: Task,
    Microtask: Microtask,
    Macrotask: Macrotask
};