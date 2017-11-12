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
LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

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
MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.isInvitedFriend = friend => friend.gender === 'female';
}
FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

function getAllGuests(friends, filter, maxFriendsCircle = Number.MAX_SAFE_INTEGER) {
    let currentFriendsCircle = friends
        .filter(friend => friend.best)
        .sort(friendsSort);

    let allGuests = [];

    while (currentFriendsCircle.length > 0 && maxFriendsCircle > 0) {
        allGuests = allGuests.concat(currentFriendsCircle);

        let newGuests = getNewGuests(currentFriendsCircle, allGuests, filter, friends);
        currentFriendsCircle = newGuests.sort(friendsSort);
        maxFriendsCircle--;
    }

    return allGuests.filter(filter.isInvitedFriend);
}

function getNewGuests(currentFriendsCircle, allGuests, filter, friends) {
    return currentFriendsCircle.reduce((friendsOfFriends, item) => {
        let friendsNames = item.friends || [];
        let newFriends = friends.filter(friend => friendsNames.includes(friend.name));
        friendsOfFriends = friendsOfFriends.concat(newFriends);

        return friendsOfFriends;
    }, []).filter(friend => !allGuests.includes(friend));
}

function friendsSort(firstFriend, secondFriend) {
    return firstFriend.name > secondFriend.name;
}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
