var Observable = require('../Observable');
module.exports = function create(subscribe) {
    return new Observable(subscribe);
};
