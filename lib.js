'use strict';

function getListInvitedFriends(friends, filter, maxLevel) {
    maxLevel = maxLevel || Infinity;
    var listInvitedFriends = [];
    var bestFriends = friends
        .filter(function (friend) {
            return friend.best;
        })
        .sort(sortName);

    while (bestFriends.length > 0 && maxLevel > 0) {
        listInvitedFriends = listInvitedFriends.concat(bestFriends);
        var friendsBestFriends = getFriendsBestFriends(bestFriends)
            .map(function (name) {
                return friends.find(function (friend) {
                    return friend.name === name;
                });
            });
        bestFriends = isDuplicate(listInvitedFriends, friendsBestFriends);
        maxLevel--;
    }

    return listInvitedFriends.filter(filter.friendsByGender);
}

function sortName(a, b) {
    if (a.name === b.name) {
        return 0;
    }

    return (a.name < b.name) ? -1 : 1;
}

function isDuplicate(listInvitedFriends, friendsBestFriends) {
    return friendsBestFriends.filter(function (friend) {
        return listInvitedFriends.indexOf(friend) === -1;
    });
}

function getFriendsBestFriends(bestFriends) {

    return bestFriends.reduce(function (friendsBestFriends, bestFriend) {
        return friendsBestFriends.concat(bestFriend.friends);
    }, []);
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    // console.info(friends, filter);
    if (!(filter instanceof Filter)) {
        throw new TypeError('Фильтр не является инстансом функции-конструктора Filter');
    }

    this.currentIndex = 0;
    this.listInvitedFriends = getListInvitedFriends(friends, filter);
}

Iterator.prototype.done = function () {

    return this.listInvitedFriends.length === this.currentIndex;
};

Iterator.prototype.next = function () {

    return this.done() ? null : this.listInvitedFriends[this.currentIndex++];
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
    // console.info(friends, filter, maxLevel);
    if (!(filter instanceof Filter)) {
        throw new TypeError('Фильтр не является инстансом функции-конструктора Filter');
    }

    Iterator.call(this, friends, filter);
    this.listInvitedFriends = getListInvitedFriends(friends, filter, maxLevel);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    // console.info('Filter');
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
    // console.info('MaleFilter');
    this.friendsByGender = function (friend) {

        return friend.gender === 'male';
    };
}

MaleFilter.prototype = Object.create(Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    // console.info('FemaleFilter');
    this.friendsByGender = function (friend) {

        return friend.gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;


