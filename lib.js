'use strict';

function alphaSort(a, b) {
    return a.name.localeCompare(b.name);
}
function getFullFriendsObjects(name, friends) {
    return friends.find(friend => friend.name === name);
}

function getDiff(a, b) {
    return a.filter(x => b.indexOf(x) === -1);
}

/** 
 * Поиск друзей
 * @param {Array} friends Массив друзей
 * @param {Number} level До какого круга друзей искать приглашенных
 * @returns {Array} список приглашенных
 */
function getInvitedFriends(friends, level = Infinity) {
    let invitedFriends = [];
    let toInvite = friends
        .filter(friend => friend.best)
        .sort((a, b) => a.name.localeCompare(b.name));
    while (level-- > 0 && toInvite.length > 0) {
        invitedFriends = invitedFriends.concat(toInvite);
        toInvite = [];
        toInvite = invitedFriends
            .reduce((acc, invitedFriend) => acc.concat(invitedFriend.friends), []);
        toInvite = toInvite
            .reduce((acc, friend) => acc.concat(getFullFriendsObjects(friend, friends)), [])
            .sort(alphaSort);
        toInvite = getDiff(toInvite, invitedFriends);
    }
    invitedFriends = invitedFriends.concat(friends
        .filter(friend => friend.friends.length === 0).sort(alphaSort));

    return invitedFriends;
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
    this.index = 0;
    this.invitedFriends = getInvitedFriends(friends).filter(filter.check);

    this.done = function () {
        return this.index === this.invitedFriends.length;
    };
    this.next = function () {
        return (this.done()) ? null : this.invitedFriends[this.index++];
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
    Iterator.call(this, friends, filter);
    this.invitedFriends = getInvitedFriends(friends, maxLevel).filter(filter.check);
}
LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.check = () => true;
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.check = friend => friend.gender === 'male';
}
MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.check = friend => friend.gender === 'female';
}
FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
