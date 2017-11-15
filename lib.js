'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError();
    }
    this.guestList = getGuestList(friends, filter);
}
Iterator.prototype.done = function () {
    return this.guestList.length === 0;
};
Iterator.prototype.next = function () {
    return this.done() ? null : this.guestList.shift();
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
    this.guestList = getGuestList(friends, filter, maxLevel);
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

function compareByName(friend, anotherFriend) {
    if (friend.name === anotherFriend.name) {
        return 0;
    }

    return friend.name > anotherFriend.name ? 1 : -1;
}

function getGuestList(friends, filter, maxLevel = Infinity) {
    let guestList = [];
    let circleOfFriends = friends
        .filter(friend => friend.best)
        .sort(compareByName);

    while (circleOfFriends.length && maxLevel--) {
        guestList = guestList.concat(circleOfFriends);
        circleOfFriends = getNewCircle(circleOfFriends, friends, guestList);
    }

    return guestList.filter(friend => filter.filter(friend));
}

function getNewCircle(currentCircle, friends, guestList) {
    return currentCircle
        .reduce((circle, friend) => [...circle, ...friend.friends], [])
        .map(name => friends.find(friend => friend.name === name))
        .filter(friend => !guestList.includes(friend))
        .sort(compareByName);
}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
