'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('argument filter is not instanse of Filter');
    }

    this.weddingGuests = selectWeddingGuests(friends, filter, Infinity);
    this.indexOfCurrentGuest = 0;
    this.done = () => this.indexOfCurrentGuest >= this.weddingGuests.length;
    this.next = () => this.done() ? null : this.weddingGuests[this.indexOfCurrentGuest++];
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
    Object.setPrototypeOf(this, Iterator.prototype);
    Iterator.call(this, friends, filter);
    this.weddingGuests = selectWeddingGuests(friends, filter, maxLevel);
}

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.isValid = () => true;
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    Object.setPrototypeOf(this, Filter.prototype);
    this.isValid = friend => friend.gender === 'male';
}

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    Object.setPrototypeOf(this, Filter.prototype);
    this.isValid = friend => friend.gender === 'female';
}

function selectWeddingGuests(friends, filter, maxLevelOfFriend) {
    let invitedFriends = [];
    let selectedFriends = friends.filter(friend => friend.best)
        .map(friend => ({ info: friend, level: 1 }));

    while (selectedFriends.length !== 0) {
        let currentFriend = selectedFriends.shift();

        if (currentFriend.level > maxLevelOfFriend) {
            break;
        }

        invitedFriends.push(currentFriend);
        let newGuests = currentFriend.info.friends
            .filter(name => !invitedFriends
                .concat(selectedFriends)
                .some(friend => friend.info.name === name))
            .map(friendName => ({
                info: friends.find(friend => friend.name === friendName),
                level: currentFriend.level + 1
            }));
        selectedFriends.push(...newGuests);
    }

    return invitedFriends
        .filter(friend => filter.isValid(friend.info))
        .sort(compareByLevelAndName)
        .map(friend => friend.info);
}

function compareByLevelAndName(firstFriend, secondFriend) {
    return firstFriend.level === secondFriend.level
        ? firstFriend.info.name.localeCompare(secondFriend.info.name)
        : firstFriend.level - secondFriend.level;
}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
