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
    this.filteredFriends = getFilteredFriends(friends, filter);
    this.done = function () {
        return this.filteredFriends.length === 0;
    };
    this.next = function () {
        return this.done() ? null : this.filteredFriends.shift();
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
    this.filteredFriends = getFilteredFriends(friends, filter, maxLevel);
}

LimitedIterator.prototype.constructor = LimitedIterator;
LimitedIterator.prototype = Object.create(Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.filterCheck = () => true;
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.filterCheck = friend => friend.gender === 'male';
}
MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.filterCheck = friend => friend.gender === 'female';
}
FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

function getFilteredFriends(friends, filter, maxLevel = Infinity) {
    let friendsLevel = friends
        .filter(friend => friend.best)
        .sort(compareName);

    return friends.reduce(iteratedFriends => {
        if (maxLevel-- > 0 && friendsLevel.length > 0) {
            iteratedFriends = iteratedFriends.concat(friendsLevel);
            const nextLevel = friendsLevel
                .reduce((namesFriends, friend) =>
                    namesFriends.concat(getUnvisited(friend.friends, namesFriends)), [])
                .map(name => friends.find(friend => friend.name === name));
            friendsLevel = getUnvisited(nextLevel, iteratedFriends)
                .sort(compareName);
        }

        return iteratedFriends;
    }, []).filter(filter.filterCheck);
}

function compareName(friend, otherFriend) {
    if (friend.name === otherFriend.name) {
        return 0;
    }

    return friend.name > otherFriend.name ? 1 : -1;
}

function getUnvisited(friends, visited) {
    return friends.filter(friend => !visited.includes(friend));
}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
