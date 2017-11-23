'use strict';

function compareNames(friend1, friend2) {
    return friend1.name.localeCompare(friend2.name);
}

function inviteBestFriends(friends) {
    return friends
        .filter(function (friend) {
            return friend.best;
        })
        .sort(compareNames);
}

function inviteFriendsOfFriends(friends, invitedFriends, newInvitedFriends) {
    return newInvitedFriends
        .reduce(function (friendsOfFriends, friend) {
            return friendsOfFriends
                .concat(friend.friends.filter(function (name) {
                    return !friendsOfFriends.includes(name);
                }));
        }, [])
        .map(function (name) {
            return friends.find(function (friend) {
                return friend.name === name;
            });
        })
        .filter(function (friend) {
            return !invitedFriends.includes(friend);
        })
        .sort(compareNames);
}

function BaseIterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('filter not instanceof Filter');
    }
    this.maxLevel = this.hasOwnProperty('maxLevel') ? this.maxLevel : Infinity;
    this.invitedFriends = BaseIterator.prototype.inviteFriends(friends, this.maxLevel)
        .filter(filter.filter);
    this.currentIndex = 0;
}

BaseIterator.prototype.inviteFriends = function (friends, maxLevel) {
    let invitedFriends = [];
    let newInvitedFriends = inviteBestFriends(friends);
    let count = 0;
    while (count < maxLevel && newInvitedFriends.length > 0) {
        invitedFriends = invitedFriends.concat(newInvitedFriends);
        newInvitedFriends = inviteFriendsOfFriends(friends, invitedFriends, newInvitedFriends);
        count++;
    }

    return invitedFriends;
};

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    BaseIterator.call(this, friends, filter);
}

Iterator.prototype.done = function () {
    return this.currentIndex === this.invitedFriends.length;
};

Iterator.prototype.next = function () {
    if (this.done()) {
        return null;
    }
    let currentIndex = this.currentIndex;
    this.currentIndex++;

    return this.invitedFriends[currentIndex];
};

Iterator.prototype = Object.create(Iterator.prototype);
Iterator.prototype.constructor = Iterator;

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
function LimitedIterator(friends, filter, maxLevel) {
    this.maxLevel = maxLevel;
    Iterator.call(this, friends, filter);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.filter = function () {
        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.filter = function (friend) {
        return friend.gender === 'male';
    };
}

MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.filter = function (friend) {
        return friend.gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
