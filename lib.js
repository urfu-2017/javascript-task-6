'use strict';

/* eslint-disable max-statements*/
function compareFriends(friend1, friend2) {
    return (friend1.name > friend2.name);
}

function getListFriends(friends) {
    let bestFriend = [];
    let lessBestFriend = [];
    for (let i = 0; i < friends.length; i++) {
        if (friends[i].best) {
            bestFriend.push(friends[i]);
        } else {
            lessBestFriend.push(friends[i]);
        }
    }
    let result = [];
    result.push(bestFriend);
    while (lessBestFriend.length !== 0) {
        let leng = lessBestFriend.length;
        let newBestFriend = [];
        for (let i = 0; i < bestFriend.length; i++) {
            let friendsFriend = bestFriend[i].friends;
            let halfResult = lessBestFriend.reduce(function (accum, elem) {
                if (friendsFriend.includes(elem.name)) {
                    accum[0].push(elem);
                } else {
                    accum[1].push(elem);
                }

                return accum;
            }, [[], []]);
            newBestFriend = newBestFriend.concat(halfResult[0]);
            lessBestFriend = halfResult[1];
        }
        if (leng === lessBestFriend.length) {
            return result;
        }
        bestFriend = newBestFriend;
        result.push(bestFriend);
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
    friends = getListFriends(friends);
    let result = [];
    for (let i = 0; i < friends.length; i++) {
        let halfResult = friends[i].filter(filter.filter).sort(compareFriends);
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

    friends = getListFriends(friends);
    let result = [];
    if (maxLevel > friends.length) {
        maxLevel = friends.length;
    }
    for (let i = 0; i < maxLevel; i++) {
        let halfResult = friends[i].filter(filter.filter).sort(compareFriends);
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
