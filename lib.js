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
    this._filter = filter;
    this._friends = {};

    for (let friend of friends) {
        this._friends[friend.name] = friend;
    }
    this._maxLevel = Infinity;
    this._currentLevel = 1;
    this._currentIndex = -1;
    this._currentLevelFriends = friends
        .filter(friend => friend.best)
        .sort(compareFriends);
    this._visited = this._currentLevelFriends.map(friend => friend.name);
    this.next();
}

Iterator.prototype = {
    done: function () {
        return this._currentLevelFriends.length === 0 || this._currentLevel > this._maxLevel;
    },

    next: function () {
        let result = this._currentLevelFriends[this._currentIndex];
        while (this._next()) {
            if (this.done()) {
                return result;
            }
        }

        return result;
    },

    _next: function () {
        this._currentIndex++;
        if (this._currentIndex >= this._currentLevelFriends.length) {
            this._currentLevel++;
            this._currentIndex = 0;
            this._currentLevelFriends = getNextLevelFriends(
                this._visited,
                this._friends,
                this._currentLevelFriends
            );
        }
        if (this.done()) {
            return false;
        }

        return !this._filter.isMatched(this._currentLevelFriends[this._currentIndex]);
    }
};

function getNextLevelFriends(visited, friends, prevFriends) {
    let result = [];
    let allNextLevelFriends = prevFriends.reduce((curr, friend) => curr.concat(friend.friends), []);
    for (let friend of allNextLevelFriends) {
        if (visited.indexOf(friend) !== -1) {
            continue;
        }
        visited.push(friend);
        result.push(friends[friend]);
    }
    result.sort(compareFriends);

    return result;
}

function compareFriends(friendA, friendB) {
    return friendA.name.localeCompare(friendB.name);
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
    if (!(filter instanceof Filter)) {
        throw new TypeError();
    }
    this._filter = filter;
    this._friends = {};

    for (let friend of friends) {
        this._friends[friend.name] = friend;
    }
    this._maxLevel = maxLevel;
    this._currentLevel = 1;
    this._currentIndex = -1;
    this._currentLevelFriends = friends
        .filter(friend => friend.best)
        .sort(compareFriends);
    this._visited = this._currentLevelFriends.map(friend => friend.name);
    this.next();
}

Object.setPrototypeOf(LimitedIterator.prototype, Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.isMatched = () => true;
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.isMatched = friend => friend.gender === 'male';
}

Object.setPrototypeOf(MaleFilter.prototype, Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.isMatched = friend => friend.gender === 'female';
}

Object.setPrototypeOf(FemaleFilter.prototype, Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
