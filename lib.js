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

    this._index = 0;
    this._guests = getAllGuests(friends, filter);
}

Iterator.prototype.done = function () {
    return this._index === this._guests.length;
};

Iterator.prototype.next = function () {
    return (this.done()) ? null : this._guests[this._index++];
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
    this._guests = getAllGuests(friends, filter, maxLevel);
}
Object.setPrototypeOf(LimitedIterator.prototype, Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.isInvitedFriend = () => true;
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.isInvitedFriend = friend => friend.gender === 'male';
}
Object.setPrototypeOf(MaleFilter.prototype, Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.isInvitedFriend = friend => friend.gender === 'female';
}
Object.setPrototypeOf(FemaleFilter.prototype, Filter.prototype);

function getAllGuests(friends, filter, maxFriendsCircle = Infinity) {
    let currentFriendsCircle = friends
        .filter(friend => friend.best)
        .sort(friendsSort);

    let allGuests = [];

    while (currentFriendsCircle.length > 0 && maxFriendsCircle > 0) {
        allGuests = allGuests.concat(currentFriendsCircle);

        let newGuests = getNewGuests(currentFriendsCircle, allGuests, friends);
        currentFriendsCircle = newGuests.sort(friendsSort);
        maxFriendsCircle--;
    }

    return allGuests.filter(filter.isInvitedFriend);
}

function getNewGuests(currentFriendsCircle, allGuests, friends) {
    return currentFriendsCircle.reduce((friendsOfFriends, item) =>
        friendsOfFriends.concat(item.friends.filter(friend => !friendsOfFriends.includes(friend)))
        , [])
        .map(name => friends.find(friend => friend.name === name))
        .filter(friend => !allGuests.includes(friend));
}

function friendsSort(firstFriend, secondFriend) {
    return firstFriend.name > secondFriend.name;
}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
