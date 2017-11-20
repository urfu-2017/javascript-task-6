'use strict';

function compareFriends(friend1, friend2) {
    return (friend1.name > friend2.name) ? 1 : -1;
}

function removeRepetitions(array) {
    let mySet = new Set(array);

    return Array.from(mySet);
}

function newFriendsFilter(resultFriends) {
    return (friend) => (!resultFriends.includes(friend));
}

function filterFriends(friends, filter, maxLevel = Infinity) {
    if (maxLevel <= 0) {
        return [];
    }
    const bestFriends = friends.filter((friend) => (friend.best)).sort(compareFriends);
    let resultFriends = [].concat(bestFriends);
    for (let currentLevel = 1; currentLevel < maxLevel; currentLevel++) {
        let friendsOfFriendsNames = removeRepetitions(resultFriends
            .reduce((result, friend) => (result.concat(friend.friends)), []));
        let friendsOfFriends = friendsOfFriendsNames
            .map((friendName) => (friends.find((friend) => (friend.name === friendName))))
            .filter(newFriendsFilter(resultFriends))
            .sort(compareFriends);
        resultFriends = resultFriends.concat(friendsOfFriends);
        if (friendsOfFriends.length === 0) {
            break;
        }
    }

    return resultFriends.filter(filter.filter);
}

function checkFilter(filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Вторым аргументом необходимо передать фильтр!');
    }
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    checkFilter(filter);
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
    let nextFriend = this.filteredFriends[this.pointer];
    this.pointer++;

    return nextFriend;
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
    checkFilter(filter);
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
