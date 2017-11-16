'use strict';
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('not instance of Filter');
    }
    this.friendsCollection = getFriends(friends, filter, Infinity);
    this.currentIndex = 0;
    this.done = function () {
        return this.friendsCollection.length === this.currentIndex;
    };
    this.next = function () {
        return this.done() ? null : this.friendsCollection[this.currentIndex++];
    };
}

function getFriends(friends, filter, maxLevel) {
    let guestCollection = [];
    let guests = friends.filter(friend => friend.best).sort(sortByName);
    let checkFriends = friend => !guestCollection.includes(friend);
    while (guests.length && maxLevel > 0) {
        guestCollection = guestCollection.concat(guests);
        guests = getNewFriends(guests)
            .map(name => friends.find(friend => friend.name === name))
            .filter(checkFriends)
            .sort(sortByName);
        maxLevel--;
    }

    return guestCollection.filter((friend) => filter.filtering(friend));
}

function getNewFriends(friends) {
    return friends.reduce(
        (newFriends, friend) => newFriends.concat(
            friend.friends.filter(name =>!newFriends.includes(name))
        ),
        []);
}

function sortByName(a, b) {
    return a.name.localeCompare(b.name);
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
    Iterator.call(this, friends, filter);
    this.friendsCollection = getFriends(friends, filter, maxLevel);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;


/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.filtering = () => true;
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.filtering = friend => friend.gender === 'male';
}

MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.filtering = friend => friend.gender === 'female';
}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
