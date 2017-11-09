'use strict';

function compareFriends(friendOne, friendTwo) {
    let nameOne = friendOne.name;
    let nameTwo = friendTwo.name;

    if (nameOne === nameTwo) {
        return 0;
    }

    return (nameOne > nameTwo) ? 1 : -1;
}

function findNotVisitedFriends(friends, resource) {
    return friends.filter(friend => !resource.includes(friend));
}

function getFriends(friends, filter, maxLevel = Infinity) {
    let bestFriends = friends
        .filter(friend => friend.best)
        .sort(compareFriends);

    let findedFriends = [];

    while (bestFriends.length > 0 && maxLevel > 0) {
        findedFriends = findedFriends.concat(bestFriends);

        let nextFriends = bestFriends
            .reduce((result, bestFriend) =>
                result.concat(findNotVisitedFriends(bestFriend.friends, result)),
            [])
            .map(name => friends.find(friend => friend.name === name));

        bestFriends = findNotVisitedFriends(nextFriends, findedFriends)
            .sort(compareFriends);

        maxLevel--;
    }

    return findedFriends.filter(filter.filter);
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Not instance of Filter');
    }

    this._pointer = 0;
    this._friends = getFriends(friends, filter);
}

Iterator.prototype.done = function () {
    return this._pointer === this._friends.length;
};

Iterator.prototype.next = function () {
    return (this.done()) ? null : this._friends[this._pointer++];
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

    this._friends = getFriends(friends, filter, maxLevel);
}
LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.filter = () => true;
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.filter = friend => friend.gender === 'male';
}
MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.filter = friend => friend.gender === 'female';
}
FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
