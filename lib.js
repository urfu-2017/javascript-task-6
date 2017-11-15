'use strict';

function sortFriendsByName(first, second) {
    if (first.name < second.name) {
        return -1;
    }
    if (first.name > second.name) {
        return 1;
    }

    return 0;
}

// function getBestFriends(friends) {
//     return friends.filter(friend => friend.best === true);
//     // .reduce((result, current) => {
//     //     result.push(current);
//     //
//     //     return result;
//     // }, []);
// }

function shouldBeVisited(friend, visited, queue) {
    return !visited.includes(friend) && queue
        .every(circle => !circle.includes(friend));
}

function getUnvisited(friends, visited) {
    return friends.filter(friend => !visited.includes(friend));
}

function getNewCircle(friends, curCircle, visited, queue) {
    let names = curCircle.reduce((result, person) => result.concat(person.friends), []);
    let newCircle = Array.from(new Set(names))
        .map(name => friends.find(friend => friend.name === name))
        .filter(friend => shouldBeVisited(friend, visited, queue))
        .sort(sortFriendsByName);

    return newCircle;
}

function getFriendsQueue(friends, filterObject) {
    const queue = [];
    let visited = [];
    let circleCount = 0;
    // const itemCount = 0;
    queue.push(friends.filter(friend => friend.best).sort(sortFriendsByName));
    while (getUnvisited(friends, visited).length !== 0) {
        const newCircle = getNewCircle(friends, queue[circleCount], visited, queue);
        if (!newCircle.length) {
            break;
        }
        queue.push(newCircle);
        visited = visited.concat(queue[circleCount]);
        circleCount++;
    }

    return queue.map(circle => circle.filter(filterObject.filter));
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Second argument is not a Filter object');
    }
    this._friendsQueue = getFriendsQueue(friends, filter);
    this._circleCounter = 0;
    console.info(this._friendsQueue);
}

Iterator.prototype.done = function () {
    return this._friendsQueue.every(circle => circle.length === 0);
};

Iterator.prototype.next = function () {
    if (this.done()) {
        return null;
    }
    const result = this._friendsQueue[this._circleCounter].shift();
    if (!this._friendsQueue[this._circleCounter].length) {
        this._circleCounter++;
    }

    return result;
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
    this._maxLevel = maxLevel;
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;
LimitedIterator.prototype.done = function () {
    return this._friendsQueue
        .every(circle => circle.length === 0) || this._circleCounter >= this._maxLevel;
};

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
