'use strict';

function compareNames(first, second) {
    return first.name.localeCompare(second.name);
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
        ._addLevels()
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

Iterator.prototype._addLevels = function () {
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
        .filter(friend => this._filter.checkFriend(friend));
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
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this._checkFriend = () => true;
}

Filter.prototype.checkFriend = function (friend) {
    return this._checkFriend(friend);
};

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    Filter.apply(this, arguments);
    this._checkFriend = friend => friend.gender === 'male';
}

MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    Filter.apply(this, arguments);
    this._checkFriend = friend => friend.gender === 'female';
}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
