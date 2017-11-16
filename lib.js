'use strict';

function sortByName(x, y) {
    return x.name < y.name;
}

function friendsByName(friends, names, haveCheck) {
    return friends.filter((friend) => {
        return names.indexOf(friend.name) + 1 && !haveCheck.includes(friend.name);
    });
}

function filterFriends(friends, filter, maxLevel) {
    let levelNow = friends.filter(function (friend) {
        return friend.best;
    }).sort(sortByName);
    let friendList = [];
    let haveCheck = [];
    let nextLevel = [];
    while (levelNow.length && maxLevel > 0) {
        let firstActualFriend = levelNow.pop();
        if (filter.filter(firstActualFriend) && !haveCheck.includes(firstActualFriend.name)) {
            friendList.push(firstActualFriend);
        }
        haveCheck.push(firstActualFriend.name);
        nextLevel = nextLevel.concat(
            friendsByName(friends, firstActualFriend.friends, haveCheck)
        );
        if (!levelNow.length) {
            maxLevel -= 1;
            levelNow = nextLevel.sort(sortByName);
            nextLevel = [];
        }
    }

    return friendList;
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('filter is not instance of constrctor Filter');
    }
    this.friends = filterFriends(friends, filter, Infinity);
    this.friendNumber = 0;
    this.done = function () {
        return this.friends.length === this.friendNumber;
    };
    this.next = function () {
        if (!(this.done())) {
            return this.friends[this.friendNumber++];
        }

        return null;
    };
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
    console.info(friends, filter, maxLevel);
    Object.setPrototypeOf(this, new Iterator(friends, filter));
    this.friends = filterFriends(friends, filter, maxLevel);
}

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
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.filter = friend => friend.gender === 'female';
}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
