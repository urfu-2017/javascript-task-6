'use strict';

function Iterator(friends, filter, maxLevel = Infinity) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Передан плохой фильтр!');
    }
    this._filter = filter;
    this._friendsMap = {};

    for (let friend of friends) {
        this._friendsMap[friend.name] = friend;
    }
    this._maxLevel = maxLevel;
    this._currentLevel = 1;
    this._currentIndex = -1;
    this._currentLevelFriends = friends
        .filter(friend => friend.best)
        .sort(compareFriends);
    this._visitedNames = this._currentLevelFriends.map(friend => friend.name);
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
        this._enumerateToNextValidElement();

        return result;
    },

    _enumerateToNextValidElement: function () {
        do {
            this._enumerateToNextElement();
        } while (!this.done() &&
            !this._filter.isMatched(this._currentLevelFriends[this._currentIndex]));
    },

    _enumerateToNextElement: function () {
        this._currentIndex++;
        if (this._currentIndex >= this._currentLevelFriends.length) {
            this._currentLevel++;
            this._currentIndex = 0;
            if (this._currentLevel <= this._maxLevel) {
                this._currentLevelFriends = getNextLevelFriends(
                    this._visitedNames,
                    this._friendsMap,
                    this._currentLevelFriends
                );
            }
        }
    }
};

function getNextLevelFriends(visited, friendsMap, prevFriends) {
    let allNextLevelFriends = prevFriends.reduce((curr, friend) => curr.concat(friend.friends), []);

    return allNextLevelFriends
        .filter(friendName => {
            if (visited.indexOf(friendName) >= 0) {
                return false;
            }
            visited.push(friendName);

            return true;
        })
        .map(friendName => friendsMap[friendName])
        .sort(compareFriends);
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
function LimitedIterator() {
    Iterator.apply(this, [].slice.call(arguments));
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
