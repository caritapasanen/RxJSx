
var map = require('rx/operators/map'),
    mergeAll = require('rx/operators/mergeAll');

module.exports = function flatMap(dest, selector, obs) {
    if(typeof selector !== "function") {
        obs = selector;
        selector = function() { return obs; };
    }
    
    return map(mergeAll(dest), selector);
}