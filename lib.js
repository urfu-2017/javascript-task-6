'use strict';

function getFriendBy(name, friends) {
    return friends.find(friend => friend.name === name);
}

function filterNames(names, filter, friends) {
    return names.filter(name => filter.isCorrect(getFriendBy(name, friends)));
}

class Iter {
    constructor(friends, filter) {
        if (!(filter instanceof Filter)) {
            throw new TypeError();
        }

        this._friends = friends;
        this._filter = filter;
        this._i = 0;
        this._level = 1;
        this._visited = [];
        this._levelNames = friends
            .filter(friend => friend.best)
            .map(friend => friend.name)
            .sort();
        this._correctLevelNames = filterNames(this._levelNames, this._filter, this._friends);
    }

    next() {
        while (!this.done()) {
            const friend = getFriendBy(this._correctLevelNames[this._i], this._friends);

            this._i += 1;

            if (this._i === this._correctLevelNames.length) {
                this._switchLevel();
            }

            return friend;
        }

        return null;
    }

    done() {
        return this._correctLevelNames.length === 0;
    }

    _switchLevel() {
        this._visited.push.apply(this._visited, this._levelNames);
        const namesCount = this._levelNames.length;

        for (let i = 0; i < namesCount; i++) {
            const name = this._levelNames.shift();
            const friend = getFriendBy(name, this._friends);
            this._levelNames.push.apply(
                this._levelNames,
                friend.friends.filter(friendName => !this._visited.includes(friendName))
            );
        }

        this._levelNames.sort();
        this._correctLevelNames = filterNames(this._levelNames, this._filter, this._friends);
        this._i = 0;
        this._level += 1;
    }
}

class LimitedIter extends Iter {
    constructor(friends, filter, maxLevel) {
        super(friends, filter);
        this._maxLevel = maxLevel;
    }

    done() {
        return super.done() || this._level > this._maxLevel;
    }
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    return new Iter(friends, filter);
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
    return new LimitedIter(friends, filter, maxLevel);
}

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.isCorrect = friend => friend !== 'undefined';
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
