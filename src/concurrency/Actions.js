var Disposable = require('../Disposable'),
    extend = require('../support/extend')
    Immediate = require('../support/immediate');

Action.prototype = extend({}, Disposable.prototype);
Action.prototype.compareTo = compareTo;

function Action(scheduler, work, time, state, compare) {
    
    var action = this;
    
    this._scheduler = scheduler;
    this._work = work;
    this._time = time;
    this._state = state;
    this._compare = compare;
    this._invoked = false;
    
    return Disposable.call(this, function dispose() {
        delete action._scheduler;
        delete action._work;
        delete action._time;
        delete action._state;
        delete action._compare;
        delete action._invoked;
        delete action._id;
        delete action._clear;
    });
};

function compareTo(other) {
    return this._compare(this._time, other._time);
}

MicrotaskAction.prototype = extend({}, Action.prototype);
MicrotaskAction.prototype.invoke = invokeMicrotask;

function MicrotaskAction() {
    return Action.apply(this, arguments);
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
        return (d = this._work(this._state, sched)) ?
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
            return (d = task._work(task._state, sched)) ?
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
    Action: Action,
    MicrotaskAction: MicrotaskAction,
    MacrotaskAction: MacrotaskAction
};