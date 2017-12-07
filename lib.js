'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel
 */
function Iterator(friends, filter, maxLevel = Infinity) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Фильтр не является инстансом функции-конструктора Filter');
    }

    this._currentFriendNumber = 0;
    this._createFriendsQueue = () => filter.filter(divideFriendsIntoLevels(friends, maxLevel)
        .reduce((allFriends, level) => allFriends.concat(level), []));

    this.done = () => {
        if (!this._friendsQueue) {
            this._friendsQueue = this._createFriendsQueue();
        }

        return this._currentFriendNumber === this._friendsQueue.length;
    };
    this.next = () => this.done() ? null : this._friendsQueue[this._currentFriendNumber++];
}

function divideFriendsIntoLevels(friends, maxLevel) {
    const queue = [];
    const allFriendsByLevels = [];
    const visited = [];
    while (hasUnvisited(friends, visited)) {
        const nextLevel = (allFriendsByLevels.length !== 0)
            ? createNewLevel(queue, visited, friends) : friends.filter(friend => friend.best);

        if (nextLevel.length === 0) {
            break;
        }
        nextLevel.sort(sortByName);
        allFriendsByLevels.push(nextLevel);
        nextLevel.forEach(friend => queue.push(friend));
    }

    return maxLevel !== Infinity ? allFriendsByLevels.slice(0, maxLevel) : allFriendsByLevels;
}

function createNewLevel(queue, visited, friends) {
    let nextLevel = [];
    function filterFarFriends(farFriend) {
        farFriend = getFriendObj(farFriend, friends);

        return !(visited.includes(farFriend)) && !queue.includes(farFriend) &&
                !(nextLevel.includes(farFriend));
    }
    while (queue.length !== 0) {
        const currentFriend = queue.shift();
        const nextFriendsNames = currentFriend.friends.filter(filterFarFriends);

        nextLevel = nextLevel.concat(nextFriendsNames.map(name => getFriendObj(name, friends)));
        visited.push(currentFriend);
    }

    return nextLevel;
}

function getFriendObj(name, friends) {
    return friends.find(friend => friend.name === name);
}

function hasUnvisited(friends, visited) {
    return friends.filter(friend => !visited.includes(friend)).length !== 0;
}

function sortByName(a, b) {
    if (a.name === b.name) {
        return 0;
    }

    return (a.name > b.name ? 1 : -1);
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
    maxLevel = maxLevel < 0 ? 0 : maxLevel;

    Iterator.call(this, friends, filter, maxLevel);
}
LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.filter = obj => obj;
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.filter = friends => friends.filter(friend => friend.gender === 'male');
}
MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.filter = friends => friends.filter(friend => friend.gender === 'female');
}
FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
