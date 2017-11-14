'use strict';

const getArrayDiff = (arr1, arr2) => arr1.filter(x => arr2.indexOf(x) < 0);

function getNextCircle(currentCircle, friends, result) {
    const nextCircle = currentCircle
        .reduce((acc, friend) => acc.concat(getArrayDiff(friend.friends, acc)), [])
        .map(name => friends.find(friend => friend.name === name));

    return getArrayDiff(nextCircle, result)
        .sort((a, b) => a.name.localeCompare(b.name));
}

function getFriends(friends, filter, maxLevel) {
    let currentCircle = friends
        .filter(friend => friend.best)
        .sort((a, b) => a.name.localeCompare(b.name));

    return friends.reduce(result => {
        if (maxLevel-- > 0 && currentCircle.length > 0) {
            result = result.concat(currentCircle);
            currentCircle = getNextCircle(currentCircle, friends, result);
        }

        return result;
    }, []).filter(filter.check);
}

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
    this.counter = 0;
    this.orderedFriends = getFriends(friends, filter, Infinity);
    this.done = function () {
        return this.counter === this.orderedFriends.length;
    };
    this.next = function () {
        return (this.done()) ? null : this.orderedFriends[this.counter++];
    };
}

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
    this.orderedFriends = getFriends(friends, filter, maxLevel);
}
LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

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
    this.check = friend => friend.gender === 'male';
}
MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.check = friend => friend.gender === 'female';
}
FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
