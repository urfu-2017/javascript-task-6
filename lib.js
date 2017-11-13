'use strict';
function findFriendObj(friendName, friends) {
    for (let i = 0; i < friends.length; i++) {
        if (friendName === friends[i].name) {
            return friends[i];
        }
    }
}
function deleteRepeats(currentFriends, prevFriends) {
    const names = [];
    const resultFriends = [];
    prevFriends.forEach(friend => names.push(friend.name));
    currentFriends.forEach(function (friend) {
        if (names.indexOf(friend.name) === -1) {
            names.push(friend.name);
            resultFriends.push(friend);
        }
    });

    return resultFriends;
}
function compare(firstFriend, secondFriend) {
    return (firstFriend.name > secondFriend.name) ? 1 : -1;
}
function checkFilter(filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('filter is not instance of Filter');
    }
}
function findFriends(friends, filter, maxLevel = Infinity) {
    checkFilter(filter);
    let resultFriends = [];
    let currentLevelFriend = friends.filter(friend => friend.best).sort(compare);
    while (maxLevel > 0 && currentLevelFriend.length > 0) {
        resultFriends = resultFriends.concat(currentLevelFriend);
        let nextLevelFriends = [];
        nextLevelFriends = currentLevelFriend.reduce((acc, friend) =>
            acc.concat(friend.friends), []);
        nextLevelFriends = deleteRepeats(nextLevelFriends
            .map(friendName => findFriendObj(friendName, friends)), resultFriends)
            .sort(compare);
        currentLevelFriend = nextLevelFriends;
        maxLevel--;
    }

    return resultFriends.filter(filter.filtrate);
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    this._index = 0;
    this._friend = findFriends(friends, filter);
}
Iterator.prototype.done = function () {
    return this._index >= this._friend.length;
};

Iterator.prototype.next = function () {
    const result = (this.done()) ? null : this._friend[this._index];
    this._index++;

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
    this._index = 0;
    this._friend = findFriends(friends, filter, maxLevel);
}
Object.setPrototypeOf(LimitedIterator.prototype, Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.filtrate = () => true;
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.filtrate = (friend) => friend.gender === 'male';
}
Object.setPrototypeOf(MaleFilter.prototype, Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.filtrate = (friend) => friend.gender === 'female';
}
Object.setPrototypeOf(FemaleFilter.prototype, Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
