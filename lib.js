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

    this._currentPosition = -1;
    this._currentFriends = friends.filter(friend => friend.best);
    this._nextFriends = [];
    this._workedFriends = [];

    this._iterationCondition = function () {
        return this._currentPosition + 1 < this._currentFriends.length;
    };

    this._setNextFriends = function (currentFriend) {
        this._nextFriends = this._nextFriends.concat(
            friends.filter(friend =>
                currentFriend.friends.indexOf(friend.name) !== -1 &&
                this._workedFriends.indexOf(friend) === -1 &&
                this._currentFriends.indexOf(friend) === -1
            )
        );
    };

    this._onEndCurrentFriends = function () {
        return null;
    };

    this._getNext = function () {
        while (this._iterationCondition()) {
            this._currentPosition++;

            const currentFriend = this._currentFriends[this._currentPosition];
            this._workedFriends.push(currentFriend);
            this._setNextFriends(currentFriend);

            const isLastFriend = this._currentPosition === this._currentFriends.length - 1;
            const isEmptyNextFriends = this._nextFriends.length === 0;
            if (isLastFriend && !isEmptyNextFriends) {
                this._currentFriends = this._nextFriends
                    .sort((a, b) => b.name > a.name ? -1 : 1)
                    .sort((a, b) => (b.best || 0) - (a.best || 0));

                this._currentPosition = -1;
                this._nextFriends = [];

                this._onEndCurrentFriends();
            }

            if (filter.isValid(currentFriend)) {
                return currentFriend;
            }
        }

        return null;
    };

    this.next = function () {
        const result = this._currentValue;

        this._currentValue = this._getNext();

        return result;
    };

    this.done = function () {
        return this._currentValue === null;
    };

    this._currentValue = this._getNext();
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

    this._currentLevel = 1;

    this._iterationCondition = function () {
        return this._currentPosition + 1 < this._currentFriends.length &&
               this._currentLevel <= maxLevel;
    };

    this._onEndCurrentFriends = function () {
        this._currentLevel++;
    };

    this.done = function () {
        const isLastCurrentFriend = this._currentPosition >= this._currentFriends.length - 1;
        const isLastLevel = this._currentLevel === maxLevel;

        return (this._currentValue === null) || (isLastLevel && isLastCurrentFriend);
    };
}

LimitedIterator.prototype = Object.create(Iterator);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.isValid = function () {
        throw new Error('Not implement method!');
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.isValid = function (friend) {
        return friend.gender === 'male';
    };
}

MaleFilter.prototype = Object.create(Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.isValid = function (friend) {
        return friend.gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
