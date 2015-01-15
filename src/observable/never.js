var Observable = require('rx/Observable'),
    noop = require('rx/support/noop'),
    staticNever = new Observable(noop);

module.exports = function never() {
    return staticNever;
}