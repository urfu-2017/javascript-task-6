'use strict';

/**
 * Итератор по друзьям
 * @constructor Iterator
 * @param {Object[]} friends
 * @param {Filter} filter
 */

function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('type error');
    }

    this.friends = this.iterateByFriends(friends, filter);
    this.countFriends = 0;
}

Iterator.prototype.done = function () {
    return this.countFriends >= this.friends.length;
};
Iterator.prototype.next = function () {
    return this.done() ? null : this.friends[this.countFriends++];
};

Iterator.prototype.createListOfFriends = function (friends, bestFriends, level) {
    var firstLevel = bestFriends;
    var secondLevel = [];
    var selectedFriends = [];

    while (level > 0) {
        firstLevel.sort(Iterator.prototype.sortFriends).forEach(function (friend) {

            if (selectedFriends.indexOf(friend) === -1) {
                selectedFriends.push(friend);
                friend.friends.forEach(function (subFriendName) {
                    var subFriend = Iterator.prototype.searchFriends(friends, subFriendName);
                    secondLevel.push(subFriend);
                });
            }
        });

        if (secondLevel.length === 0) {
            break;
        }

        firstLevel = secondLevel.slice();
        secondLevel.length = 0;
        level--;
    }

    return selectedFriends;
};

Iterator.prototype.sortFriends = function (a, b) {
    return a.name > b.name;
};

Iterator.prototype.searchFriends = function (friends, newFriendName) {
    var invitedFriends = {};

    friends.forEach(function (friend) {

        if (friend.name === newFriendName) {
            invitedFriends = friend;
        }
    });

    return invitedFriends;
};


Iterator.prototype.iterateByFriends = function (friends, filter, maxLevel) {
    var checkedLevel = (!isNaN(parseInt(maxLevel))) ? maxLevel : Infinity;
    var bestFriends = [];

    friends.forEach(function (friend) {

        if (friend.best) {
            bestFriends.push(friend);
        }
    });

    return this.createListOfFriends(friends, bestFriends, checkedLevel)
        .filter(function (selectFriend) {

            return filter.gender(selectFriend);
        });

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
    if (!(filter instanceof Filter)) {
        throw new TypeError('type error');
    }

    this.friends = this.iterateByFriends(friends, filter, maxLevel);
    this.countFriends = 0;
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor Filter
 * @return {boolean}
 */

function Filter() {}

Filter.prototype.gender = function () {
    return true;
};

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor MaleFilter
 * @return {boolean}
 */

function MaleFilter() {}

MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

MaleFilter.prototype.gender = function (friend) {
    return friend.gender === 'male';
};

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor FemaleFilter
 * @return {boolean}
 */

function FemaleFilter() {}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

FemaleFilter.prototype.gender = function (friend) {
    return friend.gender === 'female';
};

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
