'use strict';

function compareFriends(friend1, friend2) {
    return (friend1.name > friend2.name) ? 1 : -1;
}

function removeRepetitions(array) {
    var result = [];

    for (let i = 0; i < array.length; i++) {
        let currentItem = array[i];
        if (result.indexOf(currentItem) === -1) {
            result.push(currentItem);
        }
    }

    return result;
}

function filterFriends(friends, filter, maxLevel = Infinity) {
    if (maxLevel === 0) {
        return [];
    }
    const bestFriends = friends.filter((friend) => (friend.best)).sort(compareFriends);
    let resultFriends = [].concat(bestFriends);
    for (let currentLevel = 1; currentLevel < maxLevel; currentLevel++) {
        let friendsOfFriendsNames = removeRepetitions(resultFriends
            .reduce((result, friend) => (result.concat(friend.friends)), []));
        let friendsOfFriends = friendsOfFriendsNames
            .map((friendName) => (friends.find((friend) => (friend.name === friendName))))
            .sort(compareFriends);
        resultFriends = removeRepetitions(resultFriends.concat(friendsOfFriends));
        if (friendsOfFriends.length === friends.length) {
            break;
        }
    }

    return removeRepetitions(resultFriends.filter(filter.filter));
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Вторым аргументом необходимо передать фильтр!');
    }
    this.filteredFriends = filterFriends(friends, filter);
    this.pointer = 0;
}

Iterator.prototype.done = function () {
    return this.pointer === this.filteredFriends.length;
};

Iterator.prototype.next = function () {
    if (this.done()) {
        return null;
    }
    let nextFtiend = this.filteredFriends[this.pointer];
    this.pointer++;

    return nextFtiend;
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
    this.filteredFriends = filterFriends(friends, filter, maxLevel);
    this.pointer = 0;
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.filter = () => (true);
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.filter = (friend) => (friend.gender === 'male');
}


MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.filter = (friend) => (friend.gender === 'female');
}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;


exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
