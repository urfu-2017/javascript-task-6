'use strict';

function sortFriends(first, second) {
    if (first.name === second.name) {
        return 0;
    }

    return (first.name > second.name) ? 1 : -1;
}

function notVisited(friends, source) {
    return friends.filter(friend => !source.includes(friend));
}

function getAllFriends(friends, filter, maxLevel = Infinity) {
    // первый уровень - лучшие друзья
    let currentLevel = friends.filter(friend => friend.best).sort(sortFriends);
    let currentFriends = [];

    while (currentLevel.length > 0 && maxLevel > 0) {
        currentFriends = currentFriends.concat(currentLevel);
        // делаем следующий круг, просматриваем друзей друзей и проверяем были ли они просмотрены
        let nextLevelFriends = currentLevel.reduce((acc, bf) =>
            acc.concat(notVisited(bf.friends, acc)), []).map(name =>
            friends.find(friend => friend.name === name));
        // следующие уровни друзей - еще не просмотренные друзья
        currentLevel = notVisited(nextLevelFriends, currentFriends).sort(sortFriends);

        maxLevel = maxLevel - 1;
    }

    return currentFriends.filter(filter.filter);
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('filter is not instance of Filter');
    }

    this.getAllFriends = getAllFriends(friends, filter);
    this.actual = 0;
}

Iterator.prototype.done = function () {
    return this.getAllFriends.length === this.actual;
};
Iterator.prototype.next = function () {
    return this.done() ? null : this.getAllFriends[this.actual++];
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

    this.getAllFriends = getAllFriends(friends, filter, maxLevel);
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
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.filter = friend => friend.gender === 'female';
}
FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
