'use strict';

function getInvitedFriends(friends, level = Infinity) {
    let invitedFriends = [];
    let stack = friends
        .filter(friend => friend.best)
        .sort((a, b) => a.name.localeCompare(b.name));
    while (level-- > 0 && stack.length > 0) {
        invitedFriends = invitedFriends.concat(stack);
        stack = [];
        stack = invitedFriends
            .map((invitedFriend, i, arr) => friends
                .filter(friend => !arr.includes(friend) &&
                 friend.friends.includes(invitedFriend.name)));
        stack = stack.reduce((acc, members) => acc.concat(members), []);
    }

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
