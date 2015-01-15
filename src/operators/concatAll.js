
var mergeAll = require('rx/operators/mergeAll');
module.exports = function concatAll(dest) {
    return mergeAll(dest, 1);
}
