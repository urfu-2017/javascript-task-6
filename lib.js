'use strict';

function compare(firstFriend, secondFriend) {
    return (firstFriend.name > secondFriend.name) ? 1 : -1;
}
function checkFilter(filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('filter is not instance of Filter');
    }
}
function findFriend(friendName, friends) {
    for (let i = 1; i < friends.length; i++) {
        if (friendName === friends[i].name) {
            return friends[i];
        }
    }

    return -1;
}

function getLevelFriends(previousLevelFriend, resultFriends, friends) {
    let levelFriend = [];
    previousLevelFriend.forEach(friend => {
        friend.friends.forEach(nextLevelFriendName => {
            const nextLevelFriend = findFriend(nextLevelFriendName, friends);
            if (levelFriend.indexOf(nextLevelFriend) === -1 &&
                resultFriends.indexOf(nextLevelFriend) === -1 &&
                nextLevelFriend !== -1) {
                levelFriend.push(nextLevelFriend);
            }
        });
    });

    return levelFriend;
}

function findFriends(friends, filter, maxLevel = Infinity) {
    checkFilter(filter);
    const bestFriends = friends.filter(friend => friend.best).sort(compare);
    let resultFriends = [].concat(bestFriends);
    let previousLevelFriend = bestFriends;
    while (maxLevel > 1 && previousLevelFriend.length > 0) {
        let levelFriend = getLevelFriends(previousLevelFriend, resultFriends, friends);
        previousLevelFriend = [].concat(levelFriend);
        resultFriends = resultFriends.concat(levelFriend.sort(compare));
        maxLevel--;
    }

    return resultFriends.filter(friend => filter.filtrate(friend));
}

function IteratorProto() {
    this._index = 0;
    this._friend = [];

    this.done = function () {
        return this._index >= this._friend.length;
    };
    this.next = function () {
        const result = (this.done()) ? null : this._friend[this._index];
        this._index++;

        return result;
    };
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */

function Iterator(friends, filter) {
    this._friend = findFriends(friends, filter);
}
Iterator.prototype = new IteratorProto();
Iterator.constructor = Iterator;

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
function LimitedIterator(friends, filter, maxLevel) {
    this._friend = findFriends(friends, filter, maxLevel);
}
LimitedIterator.prototype = Iterator.prototype;
LimitedIterator.constructor = LimitedIterator;

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
MaleFilter.prototype = new Filter();
MaleFilter.constructor = Filter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.filtrate = (friend) => friend.gender === 'female';
}
FemaleFilter.prototype = new Filter();
FemaleFilter.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
