'use strict';


/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError();
    }
    this._filter = filter;
    this._pointer = 0;
    this._done = false;
    this._currentCircleNum = 0;
    this._circlesGenerator = _getCircles(friends);
    this._currentCircle = this._getNextCircle();
}

Iterator.prototype._getNextCircle = function () {
    this._currentCircleNum += 1;
    const next = this._circlesGenerator.next();
    this._done = next.done;
    if (this._done) {
        return undefined;
    }

    return next.value
        .filter(f => this._filter.satisfiesCondition(f));
};

Iterator.prototype.done = function () {
    return this._done;
};

Iterator.prototype.next = function () {
    if (this.done()) {
        return null;
    }
    const result = this._currentCircle[this._pointer];
    this._pointer += 1;
    if (this._pointer === this._currentCircle.length) {
        this._currentCircle = this._getNextCircle();
        this._pointer = 0;
    }

    return result;
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
    this._maxLevel = maxLevel >= 0 ? maxLevel : 0;
    Iterator.call(this, friends, filter);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.done = function () {
    return this._done || this._currentCircleNum > this._maxLevel;
};

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


function* _getCircles(friends) {
    const visited = new Set();
    const friendsByName = new Map(friends.map(f => [f.name, f]));
    let circle = friends
        .filter(f => f.best);
    while (circle.length) {
        circle.sort((a, b) => a.name.localeCompare(b.name))
            .forEach(f => visited.add(f.name));
        yield circle;
        circle = circle
            .reduce((acc, curr) => acc.concat(curr.friends), [])
            .map(fName => friendsByName.get(fName))
            .filter(f => !visited.has(f.name));
    }
    const notVisited = friends.filter(f => !visited.has(f.name));
    if (notVisited.length) {
        yield *_getCircles(notVisited);
    }
}
