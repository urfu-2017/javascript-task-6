'use strict';

function compareName(a, b) {
    if (a.name > b.name) {

        return -1;
    }
    if (a.name < b.name) {

        return 1;
    }
    if (a.name === b.name) {

        return 0;
    }
}

function inviteFriends(invited, friends) {
    let allFriends = invited.reduce(function (acc, friend) {

        return friend.friends.filter(a => !(acc.includes(a)) &&
            !(invited.some(b => b.name === a))).concat(acc);
    }, []);

    return allFriends.map(a => friends.find(b => b.name === a)).sort(compareName)
        .concat(invited);
}

function findFriends(friends, level) {
    if (level < 1) {

        return [];
    }
    let invited = friends.filter(friend => friend.best).sort(compareName);
    let moreInvited = inviteFriends(invited, friends);
    while (invited.length !== moreInvited.length && level > 1) {
        invited = moreInvited;
        moreInvited = inviteFriends(invited, friends);
        level--;
    }

    return invited;
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Not instance of Filter');
    }
    this.invitedFriends = findFriends(friends, Infinity).filter(guest => filter.filter(guest));
}

Iterator.prototype.done = function () {

    return this.invitedFriends.length === 0;
};

Iterator.prototype.next = function () {
    if (this.done()) {

        return null;
    }

    return this.invitedFriends.pop();
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
    this.invitedFriends = findFriends(friends, maxLevel).filter(guest => filter.filter(guest));
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

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.filter = friend => friend.gender === 'female';
}

FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
