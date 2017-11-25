'use strict';

/* eslint-disable max-statements*/
function compareFriends(friend1, friend2) {
    if (friend1.name > friend2.name) {
        return 1;
    } else if (friend1.name === friend2.name) {
        return 0;
    }

    return -1;
}

function getFriendsList(friends) {
    let bestFriends = [];
    let otherFriends = [];
    for (let i = 0; i < friends.length; i++) {
        if (friends[i].best) {
            bestFriends.push(friends[i]);
        } else {
            otherFriends.push(friends[i]);
        }
    }
    let result = [];
    result.push(bestFriends);
    while (otherFriends.length !== 0) {
        let length = otherFriends.length;
        let friendsFriend = [];
        for (let i = 0; i < bestFriends.length; i++) {
            friendsFriend = friendsFriend.concat(bestFriends[i].friends);
        }
        let halfResult = otherFriends.reduce(function (accum, elem) {
            if (friendsFriend.includes(elem.name)) {
                accum[0].push(elem);
            } else {
                accum[1].push(elem);
            }

            return accum;
        }, [[], []]);
        bestFriends = halfResult[0];
        otherFriends = halfResult[1];
        if (length === otherFriends.length) {
            return result;
        }
        result.push(bestFriends);
    }

    return result;
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Bad filter(');
    }
    let newFriends = getFriendsList(friends);
    let result = [];
    for (let i = 0; i < newFriends.length; i++) {
        let halfResult = newFriends[i].filter(filter.filter).sort(compareFriends);
        result = result.concat(halfResult);
    }
    this.friends = result;
    this.place = 0;
}

Iterator.prototype.done = function () {
    return this.place === this.friends.length;
};

Iterator.prototype.next = function () {
    return (this.done()) ? null : this.friends[this.place++];
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
        throw new TypeError('Bad filter(');
    }

    let newFriends = getFriendsList(friends);
    let result = [];
    let newMaxLevel = maxLevel;
    if (maxLevel > newFriends.length) {
        newMaxLevel = newFriends.length;
    }
    for (let i = 0; i < newMaxLevel; i++) {
        let halfResult = newFriends[i].filter(filter.filter).sort(compareFriends);
        result = result.concat(halfResult);
    }
    this.friends = result;
    this.place = 0;
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
