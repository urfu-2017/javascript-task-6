'use strict';

function compareName(a, b) {
    if (a.name > b.name) {

        return 1;
    }
    if (a.name < b.name) {

        return -1;
    }
    if (a.name === b.name) {

        return 0;
    }
}

function findFriendsLevel(currentFriends, friends) {
    if (currentFriends.length === 0) {
        return friends.filter(friend => friend.best)
            .sort(compareName);
    }

    return currentFriends.reduce(function (acc, friend) {
        var friendsOfFriend = friend.friends.reduce(function (localAcc, localFriend) {

            return localAcc.concat(friends.filter(value => value.name === localFriend))
                .sort(compareName);
        }, []);

        return acc.concat(friendsOfFriend);
    }, []).filter(friend => !(currentFriends.includes(friend)));
}

function findGuests(invitedFriends, friends, level) {
    if (level < 1) {

        return invitedFriends;
    }
    var newLevelFriends = findFriendsLevel(invitedFriends, friends);
    if (newLevelFriends.length === 0) {
        return invitedFriends;
    }

    return findGuests(newLevelFriends.concat(invitedFriends), friends, level - 1);
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
    this.invitedFriends = findGuests([], friends, 4).filter(guest => filter.filter(guest));
}

Iterator.prototype.done = function () {

    return this.invitedFriends.length === 0;
};

Iterator.prototype.next = function () {
    if (this.done()) {

        return null;
    }

    return this.invitedFriends.pop();
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
    this.invitedFriends = findGuests([], friends, maxLevel).filter(guest => filter.filter(guest));
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

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.filter = friend => friend.gender === 'female';
}

FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
