var mergeAll = require('./mergeAll');
module.exports = function concatAll() {
    return mergeAll.call(this, 1);
}
