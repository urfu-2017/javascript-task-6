'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Фильтр не является инстансом функции-конструктора Filter');
    }

    this.orderedFriendsByLevel = orderFriends(friends)
        .reduce((allFriends, level) => allFriends.concat(level), []);
    this.filteredFriends = filter.filter(this.orderedFriendsByLevel);

    this.done = () => this.filteredFriends.length === 0;
    this.next = () => {
        if (this.done()) {
            return null;
        }

        return this.filteredFriends.shift();
    };
}

function orderFriends(friends) {
    const queue = [];
    const allLevels = [];
    const visited = [];
    let nextLevel = friends
        .filter(friend => friend.best);
    while (getUnvisited(friends, visited).length !== 0) {
        if (allLevels.length !== 0) {
            nextLevel = createNewLevel(queue, visited, friends);
        }
        if (nextLevel.length === 0) {
            break;
        }
        nextLevel.sort(sortByName);
        allLevels.push(nextLevel);
        nextLevel.forEach(friend => queue.push(friend));
    }

    return allLevels;
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

function getUnvisited(friends, visited) {
    return friends.filter(friend => !visited.includes(friend));
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
    maxlevel = maxLevel < 0 ? 0 : maxLevel;
    
    Iterator.call(this, friends, filter);
    this.orderedFriendsByLevel = orderFriends(friends)
        .slice(0, maxLevel)
        .reduce((allFriends, level) => allFriends.concat(level), []);
    this.filteredFriends = filter.filter(this.orderedFriendsByLevel);
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
