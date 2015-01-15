var Observable = require('rx/Observable');
module.exports = function create(subscribe) {
    return new Observable(subscribe);
}