'use strict';

function getFriendBy(name, friends) {
    return friends.find(friend => friend.name === name);
}

function compareFriends(friend1, friend2) {
    return friend1.level === friend2.level
        ? friend1.friend.name > friend2.friend.name
        : friend1.level - friend2.level;
}

function filterFriends(friends, filter, maxLevel = Infinity) {
    const visitedFriends = [];
    const selectedFriends = friends
        .filter(friend => friend.best)
        .map(friend => ({ friend, level: 1 }));

    while (selectedFriends.length !== 0) {
        const selectedFriend = selectedFriends.shift();

        if (selectedFriend.level > maxLevel) {
            break;
        }

        visitedFriends.push(selectedFriend);
        selectedFriend.friend.friends.forEach(name => {
            if (!visitedFriends.some(friend => friend.friend.name === name) &&
                    !selectedFriends.some(friend => friend.friend.name === name)) {
                const friend = getFriendBy(name, friends);
                selectedFriends.push({ friend, level: selectedFriend.level + 1 });
            }
        });
    }

    return visitedFriends
        .sort(compareFriends)
        .map(friend => friend.friend)
        .filter(filter.isSuitable);
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

    this._i = 0;
    this._friends = filterFriends(friends, filter);

    this.next = () => this.done() ? null : this._friends[this._i++];
    this.done = () => this._i === this._friends.length;
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

    this._friends = filterFriends(friends, filter, maxLevel);
}

Object.setPrototypeOf(LimitedIterator.prototype, Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.isSuitable = () => true;
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.isSuitable = friend => friend.gender === 'male';
}

Object.setPrototypeOf(MaleFilter.prototype, Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.isSuitable = friend => friend.gender === 'female';
}

Object.setPrototypeOf(FemaleFilter.prototype, Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
