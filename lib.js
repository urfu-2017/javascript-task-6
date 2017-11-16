'use strict';

function getPotentialGuests(guests, friends, setOfFriends) {
    setOfFriends = changeSet(setOfFriends);

    return setOfFriends
        .map(name => friends.find(friend => friend.name === name))
        .filter((friend, i, set) => {
            return set.indexOf(friend) === i && checkFriend(guests, friend);
        })
        .sort(sortByName);
}

function changeSet(set) {
    return set
        .reduce((level, friend) => [...level, ...friend.friends], []);
}

function checkFriend(guests, friend) {
    return !guests.includes(friend);
}

function sortByName(first, second) {
    if (first.name === second.name) {
        return 0;
    }

    return first.name > second.name ? 1 : -1;
}

function getFriendList(friends, filter, level) {
    let guests = [];
    let setOfFriends = friends
        .filter(friend => friend.best)
        .sort(sortByName);

    while (level-- > 0 && setOfFriends.length > 0) {
        guests = guests.concat(setOfFriends);
        setOfFriends = getPotentialGuests(guests, friends, setOfFriends);
    }

    return guests.filter(filter.value);
}

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

    this.invitedFriends = getFriendList(friends, filter, Infinity);
    this.done = () => this.invitedFriends.length === 0;
    this.next = () => this.done() ? null : this.invitedFriends.shift();
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
    this.invitedFriends = getFriendList(friends, filter, maxLevel);
}

LimitedIterator.prototype.constructor = LimitedIterator;
LimitedIterator.prototype = Object.create(Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.value = () => true;
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.value = friend => friend.gender === 'male';
}

MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.value = friend => friend.gender === 'female';
}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
