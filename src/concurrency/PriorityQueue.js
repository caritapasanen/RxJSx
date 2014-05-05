var count = 0;

function IndexedItem(id, value) {
    this.id = id;
    this.value = value;
};

IndexedItem.prototype.compareTo = function (other) {
    var c = this.value.compareTo(other.value);
    if (c === 0) {
        c = this.id - other.id;
    }
    return c;
};

// Priority Queue for Scheduling
function PriorityQueue() {
    this.items = [];
    this.length = 0;
    return this;
};

var priorityProto = PriorityQueue.prototype;

priorityProto.isHigherPriority = function (left, right) {
    return this.items[left].compareTo(this.items[right]) < 0;
};

priorityProto.percolate = function (index) {
    if (index >= this.length || index < 0) {
        return;
    }
    var parent = index - 1 >> 1;
    if (parent < 0 || parent === index) {
        return;
    }
    if (this.isHigherPriority(index, parent)) {
        var temp = this.items[index];
        this.items[index] = this.items[parent];
        this.items[parent] = temp;
        this.percolate(parent);
    }
};

priorityProto.heapify = function (index) {
    if (index === undefined) {
        index = 0;
    }
    if (index >= this.length || index < 0) {
        return;
    }
    var left = 2 * index + 1,
        right = 2 * index + 2,
        first = index;
    if (left < this.length && this.isHigherPriority(left, first)) {
        first = left;
    }
    if (right < this.length && this.isHigherPriority(right, first)) {
        first = right;
    }
    if (first !== index) {
        var temp = this.items[index];
        this.items[index] = this.items[first];
        this.items[first] = temp;
        this.heapify(first);
    }
};

priorityProto.peek = function () {
    return this.items[0].value;
};

priorityProto.removeAt = function (index) {
    this.items[index] = this.items[--this.length];
    delete this.items[this.length];
    this.heapify();
};

priorityProto.dequeue = function () {
    var result = this.peek();
    this.removeAt(0);
    return result;
};

priorityProto.enqueue = function (item) {
    var index = this.length++;
    this.items[index] = new IndexedItem(count++, item);
    this.percolate(index);
    return item;
};

priorityProto.remove = function (item) {
    for (var i = 0; i < this.length; i++) {
        if (this.items[i].value === item) {
            this.removeAt(i);
            return true;
        }
    }
    return false;
};

priorityProto.empty = function() {
    this.items = [];
    this.length = 0;
    return this;
}

priorityProto.append = function(tail) {
    if(tail) {
        this.items.length = this.length;
        tail.items.length = tail.length;
        this.items = this.items.concat(tail.items);
        this.length += tail.length;
    }
    return this;
}

module.exports = PriorityQueue;