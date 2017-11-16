'use strict';

function getFriends(friends, filter, maxLevel = Infinity) {
    if(maxLevel <= 0) {
        return [];
    }
    let guestArray = [];
    let invetedFriends = friends
        .filter(f => f.best)
        .sort((a, b) => a.name > b.name);
    let notInvited = f => !guestArray.includes(f);

    while (maxLevel > 0 && invetedFriends.length) {
        guestArray = guestArray.concat(invetedFriends);
        invetedFriends = inviteNewFriends(invetedFriends)
            .map(name => friends.find(f => f.name === name))
            .filter(notInvited)
            .sort((a, b) => a.name > b.name);
        maxLevel--;
    }

    return guestArray.filter((f) => filter.condition(f));
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
    Iterator.call(this, friends, filter);
    this.friends = getFriends(friends, filter, maxLevel);
}

Object.setPrototypeOf(LimitedIterator, Iterator);

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
    this.condition = f => f.gender === 'male';
}

Object.setPrototypeOf(MaleFilter.prototype, Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.condition = f => f.gender === 'female';
}

Object.setPrototypeOf(FemaleFilter.prototype, Filter.prototype);


exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
