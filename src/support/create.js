function F(){}
module.exports  = function create(proto) {
    F.prototype = proto;
    var sources = Array.prototype.slice.call(arguments, 1),
        object  = new F();
    return sources.reduce(function(object, source) {
        for(var x in source) {
            if(source.hasOwnProperty(x)) {
                object[x] = source[x];
            }
        }
        return object;
    }, object);
};