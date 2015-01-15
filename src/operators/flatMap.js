
var map = require('rx/operators/map'),
    mergeAll = require('rx/operators/mergeAll');

module.exports = function flatMap(dest, selector) {
    return map(mergeAll(dest), selector);
}