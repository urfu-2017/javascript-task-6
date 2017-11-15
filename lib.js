'use strict';

function sortFriendsByName(a, b) {
    return a.name > b.name ? 1 : -1;
}


function creatLevel(friends, person, visitedFriends, next) {
    if (visitedFriends.includes(person.name)) {
        return;
    }
    visitedFriends.push(person.name);
    person.friends
        .filter(name => !(visitedFriends.includes(name)))
        .forEach(name => next.push(creatFriend(friends, name)));
    next.sort(sortFriendsByName);
}

function creatFriend(friends, name) {
    for (let friend of friends) {
        if (friend.name === name) {
            return friend;
        }
    }
}

function listInvitedFriends(friends, filter, maxLevel) {
    if (!friends || !maxLevel || maxLevel < 1) {
        return [];
    }
    let current = friends.sort(sortFriendsByName)
        .filter(person => person.best);
    let next = [];
    let visited = [];
    let currentFunc = person => {
        creatLevel(friends, person, visited, next);
    };
    while (current.length && maxLevel) {
        current.forEach(currentFunc);
        current = next;
        next = [];
        maxLevel--;
    }
    let invitedFriends = visited.map(name => creatFriend(friends, name));

    return filter.filterFrends(invitedFriends);
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('filter is not Filter');
    }
    this.friends = listInvitedFriends(friends, filter, Infinity);
    this.current = 0;
}

Iterator.prototype.done = function () {
    return this.current === this.friends.length;
};

Iterator.prototype.next = function () {
    if (this.done()) {
        return null;
    }

    return this.friends[this.current++];
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
    Object.setPrototypeOf(this, Iterator.prototype);
    Iterator.call(this, friends, filter);
    this.friends = listInvitedFriends(friends, filter, maxLevel);
}

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.filterProperty = 'every';
}

Filter.prototype.filterFrends = function (friends) {
    return friends.filter(
        friend => friend.gender === this.filterProperty || this.filterProperty === 'every',
        this);
};

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    Object.setPrototypeOf(this, Filter.prototype);
    this.filterProperty = 'male';
}

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    Object.setPrototypeOf(this, Filter.prototype);
    this.filterProperty = 'female';
}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
