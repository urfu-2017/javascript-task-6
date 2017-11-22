'use strict';


/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
function Iterator(friends, filter, maxLevel = Infinity) {
    if (!(filter instanceof Filter)) {
        throw new TypeError();
    }
    this._friendsGenerator = _iterFriends(friends, maxLevel < 0 ? 0 : maxLevel);
    this._filter = filter;
    this._current = this._nextFiltered();
}

Iterator.prototype._nextFiltered = function () {
    let result;
    do {
        const next = this._friendsGenerator.next();
        if (next.done || this._filter.check(next.value)) {
            result = next;
        }
    } while (!result);

    return result;
};

Iterator.prototype.done = function () {
    return this._current.done;
};

Iterator.prototype.next = function () {
    if (this.done()) {
        return null;
    }
    const result = this._current;
    this._current = this._nextFiltered();

    return result.value;
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
    Iterator.call(this, friends, filter, maxLevel);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);


/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.check = () => true;
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    Object.setPrototypeOf(this, Filter.prototype);
    this.check = friend => friend.gender === 'male';
}

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    Object.setPrototypeOf(this, Filter.prototype);
    this.check = friend => friend.gender === 'female';
}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;


const _getFriendsByNames = (friends) =>
    new Map(friends.map(f => [f.name, f]));


const _getNextCircle = (friends, friendsByNames, visited) =>
    friends.map(f => f.friends)
        .filter(Boolean)
        .reduce((acc, curr) => acc.concat(curr), [])
        .filter(fName => !visited.has(fName))
        .sort((a, b) => a.localeCompare(b))
        .map(fName => friendsByNames.get(fName));


function* _iterFriends(friends, maxCircle = Infinity) {
    const friendsByNames = _getFriendsByNames(friends);
    const visited = new Set();
    const billy = {
        name: 'Billy',
        friends: friends.filter(f => f.best)
            .map(f => f.name)
    };
    let circleNum = 0;
    let currentCircle = [billy];
    do {
        currentCircle = _getNextCircle(currentCircle, friendsByNames, visited);
        currentCircle.forEach(f => visited.add(f.name));
        yield* currentCircle;
        circleNum += 1;
    } while (circleNum < maxCircle && currentCircle.length > 0);
}
