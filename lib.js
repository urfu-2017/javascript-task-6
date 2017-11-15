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

    this.orderedFriendsByLevel = orderFriends(friends);
    this.filteredFriends = this.orderedFriendsByLevel.map(level => filter.filter(level));

    this.done = () => this.filteredFriends.every(level => level.length === 0);
    this.next = () => {
        if (this.done()) {
            return null;
        }
        let i = 0;
        while (this.filteredFriends[i].length === 0) {
            i++;
        }

        return this.filteredFriends[i].shift();
    };
}

function orderFriends(friends) {
    const queue = [];
    const result = [];
    const visited = [];
    let nextLevel = friends
        .filter(friend => friend.best);
    while (getUnvisited(friends, visited).length !== 0) {
        if (result.length !== 0) {
            nextLevel = createNewLevel(queue, visited, friends);
        }
        if (nextLevel.length === 0) {
            break;
        }
        nextLevel.sort(sortByName);
        result.push(nextLevel);
        nextLevel.forEach(friend => queue.push(friend));
    }

    return result;
}

function createNewLevel(queue, visited, friends) {
    let nextLevel = [];
    while (queue.length !== 0) {
        const currentEl = queue.shift();
        const nextFriendsNames = currentEl.friends.filter(farFriend => {
            farFriend = getFriendObj(farFriend, friends);

            return !(visited.includes(farFriend)) && !queue.includes(farFriend) &&
                !(farFriend === currentEl);
        });
        nextLevel = nextLevel.concat(nextFriendsNames.map(name => getFriendObj(name, friends)));
        visited.push(currentEl);
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

    if (maxLevel <= 0) {
        this.filteredFriends = [];

        return;
    }
    Iterator.call(this, friends, filter);
    this.filteredFriends = this.filteredFriends.slice(0, maxLevel);
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
