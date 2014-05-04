var slice = Array.prototype.slice;
module.exports  = function create(proto) {
    F.prototype = proto;
    return slice
        .call(arguments, 1)
        .reduce(applySourceTo, new F());
};
function F(){};
function applySourceTo(object, source) {
    for(var x in source) {
        if(source.hasOwnProperty(x)) {
            object[x] = source[x];
        }
    }
    return object;
};