var Observable = require('../Observable'),
    noop = require('../support/noop'),
    staticNever = new Observable(noop);

module.exports = function never() {
    return staticNever;
}