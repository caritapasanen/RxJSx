var noop = require('../support/noop');
module.exports = function ignore() {
    return this.clone({
        _onNext: noop
    });
}