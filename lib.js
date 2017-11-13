'use strict';

let friendsSortRule = (first, second) => first.name.localeCompare(second.name);

/**
 * Подготовка списка друзей, которых Билли пригласит на свадьбу.
 * @param {Object[]} friends – список друзей из блокнота Билли.
 * @param {Filter} filter – фильтр для друзей.
 * @param {Number} maxLevel – максимальный круг друзей.
 * @returns {Object[]} – отфильрованный и отсортированный список приглашаемых друзей.
 */
function collectInvitedFriends(friends, filter, maxLevel = Infinity) {
    let invitedFriends = [];
    let currentLevelFriends = friends.filter(friend => friend.best).sort(friendsSortRule);

    while (currentLevelFriends.length > 0 && maxLevel > 0) {
        invitedFriends.splice(invitedFriends.length, 0, ...currentLevelFriends);

        currentLevelFriends = currentLevelFriends
            .reduce((acc, friend) => acc.concat(friend.friends), [])
            .map(friendName => friends.find(friend => friend.name === friendName))
            .filter((friend, pos, arr) => {
                return !invitedFriends.includes(friend) && arr.indexOf(friend) === pos;
            })
            .sort(friendsSortRule);

        maxLevel--;
    }

    return invitedFriends.filter(filter.condition);
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

    this.invitedGuests = collectInvitedFriends(friends, filter);
}

/**
 * Итерация по приглашаемым друзьям.
 * @returns {null|Object} null если обход закончен иначе объект описывающий друга.
 */
Iterator.prototype.next = function () {
    return this.done() ? null : this.invitedGuests.shift();
};

/**
 * Проверка завершения обхода.
 * @returns {boolean} true, если обход закончен, и false в противном случае.
 */
Iterator.prototype.done = function () {
    return this.invitedGuests.length === 0;
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
    Iterator.call(this, friends, filter);
    this.invitedGuests = collectInvitedFriends(friends, filter, maxLevel);
}

Object.setPrototypeOf(LimitedIterator.prototype, Iterator.prototype);

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

Object.setPrototypeOf(MaleFilter.prototype, Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.condition = friend => friend.gender === 'female';
}

Object.setPrototypeOf(FemaleFilter.prototype, Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
exports.isStar = true;
