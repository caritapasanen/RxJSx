module.exports = function filter(selector) {
    return function(destination) {
        return {
            onNext: function(x) {
                if(selector(x)) {
                    return destination.onNext(x);
                }
            }
        }
    }
}