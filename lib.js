'use strict';

function sortString(a, b) {
    return a.name > b.name ? 1 : -1;
}


function creatLevel(friends, person, visitedFriends, next) {
    if (visitedFriends.indexOf(person.name) !== -1) {
        return;
    }
    visitedFriends.push(person.name);
    person.friends.filter(name => visitedFriends.indexOf(name) === -1)
        .forEach(name => next.push(creatFriend(friends, name)));
    next.sort(sortString);
}

function creatFriend(friends, name) {
    for (let friend of friends) {
        if (friend.name === name) {
            return friend;
        }
    }
}

function iterToFriends(friends, filter, maxLevel) {
    if (!friends || !maxLevel || maxLevel < 1) {
        return [];
    }
    let current = friends.sort(sortString)
        .filter(person => person.best);
    let next = [];
    let visited = [];
    let currentFunc = person => {
        creatLevel(friends, person, visited, next);
    };
    while (current.length !== 0 && maxLevel !== 0) {
        current
            .forEach(currentFunc);
        current = next;
        next = [];
        maxLevel--;
    }

    return filter.filterFrends(visited.map(name => creatFriend(friends, name)));
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
    this.friends = iterToFriends(friends, filter, Infinity);
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
    this.friends = iterToFriends(friends, filter, maxLevel);
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
        (friend) =>
            friend.gender === this.filterProperty || this.filterProperty === 'every', this);
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
