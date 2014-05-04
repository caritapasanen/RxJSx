var Disposable = require('../Disposable'),
    extend = require('../support/extend')
    Immediate = require('../support/immediate');

Action.prototype = extend({}, Disposable.prototype);
Action.prototype.compareTo = compareTo;

function Action(scheduler, work, time, state, compare) {
    this.scheduler = scheduler;
    this.work = work;
    this.time = time;
    this.state = state;
    this.compare = compare;
    this.invoked = false;
    return Disposable.call(this, function dispose() {
        this.scheduler = undefined;
        this.work = undefined;
        this.time = undefined;
        this.state = undefined;
        this.compare = undefined;
        this.invoked = undefined;
        this.id = undefined;
        this.clear = undefined;
    });
};

function compareTo(other) {
    return this.compare(this.time, other.time);
}

MicrotaskAction.prototype = extend({}, Action.prototype);
MicrotaskAction.prototype.invoke = invokeMicrotask;

function MicrotaskAction() {
    return Action.apply(this, arguments);
};

function invokeMicrotask() {
    if(this.disposed === false) {
        
        var sched = this.scheduler,
            time = this.time,
            d;
        
        while(time - sched.now() > 0) {
            // block -- microtasks are synchronous
        }
        
        this.invoked = true;
        // Probably don't have to check disposed here, but maybe
        // if we run microtasks on Web Workers or separate node
        // processes? Need to investigate.
        // if(this.disposed === false) {
        return (d = this.work(this.state, sched)) ?
            d.add(this) :
            this.dispose();
        // }
    }
    return this;
};

MacrotaskAction.prototype = extend({}, Action.prototype);
MacrotaskAction.prototype.invoke = invokeMacrotask;

function MacrotaskAction() {
    return Action.apply(this, arguments);
};

function invokeMacrotask() {
    if(this.disposed === true) {
        return this;
    }
    
    var task  = this,
        time  = task.time,
        sched = task.scheduler,
        delta = time - sched.now(),
        invoked = task.invoked,
        clear, id, d;
    
    if(invoked === false) {
        if(delta <= 0) {
            clear = Immediate.clearImmediate;
            id = Immediate.setImmediate(execute);
        } else {
            clear = clearTimeout;
            id = setTimeout(execute, delta);
        }
        task.id = id;
        task.clear = clear;
        task.invoked = true;
    } else if(delta <= 0) {
        execute();
    }
    
    return task.add(dispose);
    
    function execute() {
        id = task.id;
        task.id = undefined;
        task.clear(id);
        if(task.disposed === false) {
            return (d = task.work(task.state, sched)) ?
                d.add(task) :
                task.dispose();
        }
    }
    function dispose() {
        if(id = task.id) {
            task.id = undefined;
            task.clear(id);
        }
    }
};

module.exports = {
    Action: Action,
    MicrotaskAction: MicrotaskAction,
    MacrotaskAction: MacrotaskAction
};