'use strict';

function sortByAlphabet(first, second) {
    if (first.name === second.name) {
        return 0;
    }

    return first.name > second.name ? 1 : -1;
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Wrong Filter');
    }
    this._friends = friends;
    this._filter = filter;
    this._invitedFriends = [];
    this._friendsNames = [];
    this._activeLvl = [];
    this._level = 1;
    this._init();
    this._addLvls();
    this._invitedFriends = this._filter.filterFriends(this._invitedFriends);
}

Iterator.prototype._init = function () {
    if (!this._maxLevel) {
        this._maxLevel = Number.MAX_SAFE_INTEGER;
    }
    this._activeLvl = this._friends
        .filter(friend => friend.best)
        .sort(sortByAlphabet);

    this._activeLvl.forEach(friend => {
        this._friendsNames.push(friend.name);
    });
};

Iterator.prototype._addLvls = function () {
    while ((this._level <= this._maxLevel) && (this._activeLvl.length !== 0)) {
        this._invitedFriends = this._invitedFriends.concat(this._activeLvl);
        this._level++;
        this._activeLvl = this._activeLvl
            .reduce((newLvlNames, friend) =>
                newLvlNames.concat(
                    friend.friends.filter(name =>
                        !this._friendsNames.includes(name) &&
                        !newLvlNames.includes(name)
                    )), [])
            .map(friendName => this._friends.find(friend => friendName === friend.name))
            .sort(sortByAlphabet);
        this._activeLvl.forEach(friend => {
            this._friendsNames.push(friend.name);
        });
    }
};

Iterator.prototype._filterFriends = function () {
    this._invitedFriends = this._invitedFriends
        .filter(friend => this._filter.check(friend.gender));
};

Iterator.prototype.next = function () {
    return this._invitedFriends.shift() || null;
};

Iterator.prototype.done = function () {
    return this._invitedFriends.length === 0;
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
    this._maxLevel = maxLevel;
    Iterator.call(this, friends, filter);
}

Object.setPrototypeOf(LimitedIterator.prototype, Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.fltr = 'everyone';
}

Filter.prototype.filterFriends = function (friends) {
    if (this.fltr === 'everyone') {
        return friends;
    }

    return friends.filter(friend => friend.gender === this.fltr);
};

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.fltr = 'male';
}

Object.setPrototypeOf(MaleFilter.prototype, Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.fltr = 'female';
}

Object.setPrototypeOf(FemaleFilter.prototype, Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
