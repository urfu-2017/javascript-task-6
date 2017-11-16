'use strict';


/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel
 */
function Iterator(friends, filter, maxLevel = Infinity) {
    if (!(filter instanceof Filter)) {
        throw new TypeError();
    }
    this._pointer = 0;
    this._friends = [].concat(..._getCircles(friends, maxLevel))
        .filter(filter.satisfiesCondition);
}

Iterator.prototype.done = function () {
    return this._pointer === this._friends.length;
};

Iterator.prototype.next = function () {
    if (this.done()) {
        return null;
    }

    return this._friends[this._pointer++];
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
    Iterator.call(this, friends, filter, maxLevel >= 0 ? maxLevel : 0);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.satisfiesCondition = () => true;
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    Object.setPrototypeOf(this, Filter.prototype);
    this.satisfiesCondition = friend => friend.gender === 'male';
}

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    Object.setPrototypeOf(this, Filter.prototype);
    this.satisfiesCondition = friend => friend.gender === 'female';

}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;


function* _getCircles(friends, maxLevel) {
    const visited = new Set();
    const friendsByName = new Map(friends.map(f => [f.name, f]));
    let circle = friends
        .filter(f => f.best);
    let level = 0;
    while (circle.length && level < maxLevel) {
        circle.sort((a, b) => a.name.localeCompare(b.name))
            .forEach(f => visited.add(f.name));
        yield circle;
        circle = circle
            .filter(f => f.friends)
            .reduce((acc, curr) => acc.concat(curr.friends), [])
            .map(fName => friendsByName.get(fName))
            .filter(f => !visited.has(f.name));
        level += 1;
    }
}
