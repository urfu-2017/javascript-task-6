'use strict';

function sortFriendsByName(first, second) {
    if (first.name === second.name) {
        return 0;
    }

    return first.name < second.name ? -1 : 1;
}

function isNotVisited(friend, visited, queue) {
    return !visited.includes(friend) && queue.every(circle => !circle.includes(friend));
}

function hasUnvisitedFriends(friends, visited) {
    return friends.some(friend => !visited.includes(friend));
}

function getNewLevel(friends, currentLevel, visited, queue) {
    const names = currentLevel.reduce((result, person) => result.concat(person.friends), []);

    return Array.from(new Set(names))
        .map(name => friends.find(friend => friend.name === name))
        .filter(friend => isNotVisited(friend, visited, queue))
        .sort(sortFriendsByName);
}

function getFriendsQueue(friends, filterObject, maxLevel = Number.POSITIVE_INFINITY) {
    if (maxLevel === 0) {
        return [];
    }
    const queue = [];
    let visited = [];
    let circleCount = 0;
    queue.push(friends.filter(friend => friend.best).sort(sortFriendsByName));
    while (hasUnvisitedFriends(friends, visited) && circleCount < maxLevel - 1) {
        const newCircle = getNewLevel(friends, queue[circleCount], visited, queue);
        if (!newCircle.length) {
            break;
        }
        queue.push(newCircle);
        visited = visited.concat(queue[circleCount]);
        circleCount++;
    }

    return queue.map(circle => circle.filter(filterObject.filter));
}

function checkFilter(filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Second argument is not a Filter object');
    }
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    checkFilter(filter);
    this._friendsQueue = getFriendsQueue(friends, filter)
        .reduce((result, level) => result.concat(level), []);
}

Iterator.prototype.done = function () {
    return this._friendsQueue.length === 0;
};

Iterator.prototype.next = function () {
    if (this.done()) {
        return null;
    }

    return this._friendsQueue.shift();
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
    checkFilter(filter);
    if (maxLevel < 0) {
        maxLevel = 0;
    }
    this._friendsQueue = getFriendsQueue(friends, filter, maxLevel)
        .reduce((result, level) => result.concat(level), []);
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
    this.filter = person => person.gender === 'male';
}

MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.filter = person => person.gender === 'female';
}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
