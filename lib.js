'use strict';

function Iterator(friends, filter, maxLevel) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Передан плохой фильтр!');
    }
    this._filter = filter;
    this._friends = {};

    for (let friend of friends) {
        this._friends[friend.name] = friend;
    }
    if (maxLevel === undefined) {
        maxLevel = Infinity;
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

Iterator.prototype = {
    done: function () {
        return this._currentLevelFriends.length === 0 || this._currentLevel > this._maxLevel;
    },

    next: function () {
        if (this.done()) {
            return null;
        }
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

function getNextLevelFriends(visited, friendsMap, prevFriends) {
    let allNextLevelFriends = prevFriends.reduce((curr, friend) => curr.concat(friend.friends), []);
    let friends = allNextLevelFriends
        .filter(friendName => visited.indexOf(friendName) === -1)
        .map(friendName => friendsMap[friendName])
        .sort(compareFriends);
    for (let friend of friends) {
        visited.push(friend.name);
    }

    return friends;
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
    Iterator.apply(this, [friends, filter, maxLevel]);
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
