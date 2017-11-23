'use strict';
function createListOfFriends(friends, bestFriends, level) {
    var firstLevel = bestFriends;
    var secondLevel = [];
    var selectedFriends = [];

    while (level > 0) {
        firstLevel.sort(sortFriends).forEach(function (friend) {

            if (selectedFriends.indexOf(friend) === -1) {
                selectedFriends.push(friend);
                friend.friends.forEach(function (subFriendName) {
                    var subFriend = searchFriends(friends, subFriendName);
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
}
createListOfFriends.prototype = Object.create(iterateByFriends.prototype);

function sortFriends(a, b) {
    return a.name > b.name;
}
sortFriends.prototype = Object.create(createListOfFriends.prototype);

function searchFriends(friends, newFriendName) {
    var invitedFriends = {};

    friends.forEach(function (friend) {

        if (friend.name === newFriendName) {
            invitedFriends = friend;
        }
    });

    return invitedFriends;
}

searchFriends.prototype = Object.create(LimitedIterator.prototype);

function iterateByFriends(friends, filter, maxLevel) {
    var checkedLevel = (!isNaN(parseInt(maxLevel))) ? maxLevel : Infinity;
    var bestFriends = [];

    friends.forEach(function (friend) {

        if (friend.best) {
            bestFriends.push(friend);
        }
    });

    return createListOfFriends(friends, bestFriends, checkedLevel)
        .filter(function (selectFriend) {

            return filter.gender(selectFriend);
        });

}
iterateByFriends.prototype = Object.create(Iterator.prototype);

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

    this.iterateByFriends = iterateByFriends(friends, filter);
    this.countFriends = 0;
}

Iterator.prototype.done = function () {
    return this.countFriends >= this.iterateByFriends.length;
};
Iterator.prototype.next = function () {
    return this.done() ? null : this.iterateByFriends[this.countFriends++];
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

    this.iterateByFriends = iterateByFriends(friends, filter, maxLevel);
    this.countFriends = 0;
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor Filter
 * @return {boolean}
 */

function Filter() {
    this.gender = function () {
        return true;
    };
}

Filter.prototype = Object.create(Iterator.prototype);

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor MaleFilter
 * @return {boolean}
 */

function MaleFilter() {
    this.gender = function (friend) {
        return friend.gender === 'male';
    };
}

MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor FemaleFilter
 * @return {boolean}
 */

function FemaleFilter() {
    this.gender = function (friend) {
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
