'use strict';

let Graph = require('./graph');

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('This is Not the Filter You Are Looking For');
    }
    this.graph = new Graph(friends, filter);
}
Iterator.prototype.done = function () {
    return this.graph.nodes.length === 0;
};
Iterator.prototype.next = function () {
    return this.graph.next();
};

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
function LimitedIterator(friends, filter, maxLevel) {
    Iterator.call(this, friends, filter);
    this.graph.filter(node => node.deep < maxLevel);
}
LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;


/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {}
Filter.prototype.func = () => true;

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {}
MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.func = friend => friend.gender === 'male';


/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {}
FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.func = friend => friend.gender === 'female';

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
