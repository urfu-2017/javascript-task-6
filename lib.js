'use strict';

function getFriends(friends, filter, maxLevel = Infinity) {
    let guestArray = [];
    let invitedFriends = inviteBestFriends(friends);
    let notInvited = friend => !guestArray.includes(friend);

    while (maxLevel > 0 && invitedFriends.length) {
        guestArray = guestArray.concat(invitedFriends);
        invitedFriends = inviteNewFriends(invitedFriends)
            .map(name => friends.find(friend => friend.name === name))
            .filter(notInvited)
            .sort((a, b) => a.name > b.name);
        maxLevel--;
    }

    return guestArray.filter((f) => filter.condition(f));
}

function inviteBestFriends(friends) {
    return friends
        .filter(friend => friend.best)
        .sort((a, b) => a.name > b.name);
}

function inviteNewFriends(friends) {
    return friends.reduce((newFriends, friend) =>
        newFriends.concat(friend.friends.filter(name =>
            !newFriends.includes(name))), []);
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

    this.friends = getFriends(friends, filter);
    this._index = 0;
    this.done = () => this.friends.length === this._index;
    this.next = () => this.done() ? null : this.friends[this._index++];
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
    if (!(maxLevel > 0)) {
        this.done = () => true;
    }
    Iterator.call(this, friends, filter);
    this.friends = getFriends(friends, filter, maxLevel);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.condition = () => true;
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.condition = friend => friend.gender === 'male';
}

MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.condition = friend => friend.gender === 'female';
}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
