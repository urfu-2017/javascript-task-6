'use strict';

function compareNames(a, b) {
    return a.name.localeCompare(b.name);
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
    this._friendsNames = new Set();
    this._activeLevel = [];
    this._level = 1;

    this
        ._init()
        ._addLvls()
        ._filterFriends();
}

Iterator.prototype._init = function () {
    if (this._maxLevel === undefined) {
        this._maxLevel = Infinity;
    }
    this._activeLevel = this._friends
        .filter(friend => friend.best)
        .sort(compareNames);
    this._activeLevel.forEach(friend => {
        this._friendsNames.add(friend.name);
    });

    return this;
};

Iterator.prototype._addLvls = function () {
    while (this._maxLevel >= this._level && this._activeLevel.length !== 0) {
        this._invitedFriends = this._invitedFriends.concat(this._activeLevel);
        this._level++;
        this._activeLevel = this._activeLevel
            .reduce((newLvlNames, friend) =>
                newLvlNames.concat(
                    friend.friends.filter(name => {
                        let isFriendInvited = this._friendsNames.has(name);
                        this._friendsNames.add(name);

                        return !isFriendInvited;
                    })), [])
            .map(friendName => this._friends.find(friend => friendName === friend.name))
            .sort(compareNames);
    }

    return this;
};

Iterator.prototype._filterFriends = function () {
    this._invitedFriends = this._invitedFriends
        .filter(friend => this._filter._checkFriend(friend));
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
    Iterator.apply(this, arguments);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this._checkFriend = () => true;
}

Filter.prototype._checkFriend = function (friend) {
    return friend.gender === this._filter;
};

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this._filter = 'male';
}

MaleFilter.prototype = Object.create(Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this._filter = 'female';
}

FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
