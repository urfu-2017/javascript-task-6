'use strict';

function getListInvitedFriends(friends, filter, maxLevel) {
    maxLevel = maxLevel || Infinity;
    var listInvitedFriends = [];
    var bestFriends = friends
        .filter(function (friend) {
            return friend.best;
        })
        .sort(sortName);

    var invitedFriends = bestFriends;

    var isDuplicate = function (friend) {

        return !listInvitedFriends.includes(friend);
    };

    while (invitedFriends.length > 0 && maxLevel > 0) {
        listInvitedFriends = listInvitedFriends.concat(invitedFriends);
        var friendsBestFriends = getFriendsBestFriends(invitedFriends)
            .map(function (name) {
                return friends.find(function (friend) {
                    return friend.name === name;
                });
            });
        invitedFriends = friendsBestFriends
            .filter(isDuplicate)
            .sort(sortName);
        maxLevel--;
    }

    return listInvitedFriends.filter(filter.friendsByGender);
}

function sortName(a, b) {

    return a.name.localeCompare(b.name);
}

function getFriendsBestFriends(bestFriends) {

    return bestFriends.reduce(function (friendsBestFriends, bestFriend) {
        return friendsBestFriends.concat(bestFriend.friends
            .filter(function (name) {
                return !friendsBestFriends.includes(name);
            })
        );
    }, []);
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Фильтр не является инстансом функции-конструктора Filter');
    }

    this.listInvitedFriends = getListInvitedFriends(friends, filter);
    this.currentIndex = 0;
}

Iterator.prototype.done = function () {

    return this.listInvitedFriends.length === this.currentIndex;
};

Iterator.prototype.next = function () {

    if (this.done()) {
        return null;
    }

    return this.listInvitedFriends[this.currentIndex++];
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
    if (maxLevel <= 0) {
        this.listInvitedFriends = [];
    } else {
        this.listInvitedFriends = getListInvitedFriends(friends, filter, maxLevel);
    }
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.friendsByGender = function () {

        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.friendsByGender = function (friend) {

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
    this.friendsByGender = function (friend) {

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


