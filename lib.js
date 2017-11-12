'use strict';

function unite(arr1, arr2) {
    return [...new Set(arr1.concat(arr2))];
}

function getFriendBy(name, friends) {
    return friends.find(friend => friend.name === name);
}

function filterNames(names, filter, friends) {
    return names.filter(name => filter.isCorrect(getFriendBy(name, friends)));
}

function switchFriendsLevel(levelNames, friends, visited) {
    let nextLevelNames = [];

    for (let name of levelNames) {
        const friend = getFriendBy(name, friends);
        nextLevelNames = unite(
            nextLevelNames,
            friend.friends.filter(friendName => !visited.includes(friendName))
        );
    }

    return nextLevelNames;
}

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

    this._friends = friends;
    this._filter = filter;
    this._i = 0;
    this._level = 1;
    this._maxLevel = Infinity;
    this._visited = [];
    this._levelNames = friends
        .filter(friend => friend.best)
        .map(friend => friend.name)
        .sort();
    this._correctLevelNames = filterNames(this._levelNames, this._filter, this._friends);

    this.next = () => {
        while (!this.done()) {
            const friend = getFriendBy(this._correctLevelNames[this._i], this._friends);

            this._i += 1;

            if (this._i === this._correctLevelNames.length) {
                this._visited = unite(this._visited, this._levelNames);
                this._levelNames = switchFriendsLevel(
                    this._levelNames, this._friends, this._visited
                ).sort();
                this._correctLevelNames = filterNames(
                    this._levelNames, this._filter, this._friends
                );
                this._i = 0;
                this._level += 1;
            }

            return friend;
        }

        return null;
    };

    this.done = () => this._correctLevelNames.length === 0 || this._level > this._maxLevel;
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
    this._maxLevel = maxLevel;
}

Object.setPrototypeOf(LimitedIterator.prototype, Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.isCorrect = () => true;
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.isCorrect = friend => friend.gender === 'male';
}

Object.setPrototypeOf(MaleFilter.prototype, Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.isCorrect = friend => friend.gender === 'female';
}

Object.setPrototypeOf(FemaleFilter.prototype, Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
