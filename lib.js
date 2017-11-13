'use strict';

function __extends(subClass, superClass) {
    Object.setPrototypeOf(subClass, superClass);

    function ProtoChain() {
        this.constructor = subClass;
    }

    ProtoChain.prototype = superClass.prototype;

    subClass.prototype = new ProtoChain();
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
const IteratorClass = (function () {
    function Iterator(friends, filter) {
        if (!(filter instanceof Filter)) {
            throw new TypeError();
        }

        this._currentPosition = 0;
        this._friendsMap = {};
        this._iterableArray = [];

        this._friendsRaw = friends;
        this._filter = filter;

        this._init();
    }

    Iterator.prototype._init = function () {
        this._friendsMap = this._friendsRaw.reduce((obj, friend) => {
            obj[friend.name] = friend;

            return obj;
        }, {});

        const bestFriendsNames = this._friendsRaw
            .filter(friend => friend.best)
            .map(friend => friend.name);

        this._iterableArray = this._getArrayForIterator(bestFriendsNames, bestFriendsNames)
            .filter(friendName => this._filter.isValid(this._friendsMap[friendName]));
    };
    Iterator.prototype._getFriendsOf = function (currentFriendsNames) {
        return currentFriendsNames
            .reduce(
                (nextFriends, friendName) =>
                    nextFriends.concat(this._friendsMap[friendName].friends),
                []
            );
    };
    Iterator.prototype._getArrayForIterator = function (friendsArray, workedFriendsNames) {
        friendsArray.sort();

        const nextFriendsNames = this._getFriendsOf(friendsArray)
            .filter(friendName => workedFriendsNames.indexOf(friendName) === -1);

        if (nextFriendsNames.length === 0) {
            return friendsArray;
        }

        return friendsArray.concat(
            this._getArrayForIterator(nextFriendsNames, workedFriendsNames.concat(nextFriendsNames))
        );
    };
    Iterator.prototype.next = function () {
        return this._friendsMap[this._iterableArray[this._currentPosition++]] || null;
    };
    Iterator.prototype.done = function () {
        return this._currentPosition >= this._iterableArray.length;
    };

    return Iterator;
}());

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
const LimitedIteratorClass = (function () {
    __extends(LimitedIterator, IteratorClass);

    function LimitedIterator(friends, filter, maxLevel) {
        this._maxLevel = maxLevel;

        return IteratorClass.call(this, friends, filter);
    }

    LimitedIterator.prototype._getArrayForIterator = function (
        friendsArray,
        workedFriendsNames,
        currentLevel = 1
    ) {
        friendsArray.sort();

        const nextFriendsNames = this._getFriendsOf(friendsArray)
            .filter(friendName => workedFriendsNames.indexOf(friendName) === -1);

        if (nextFriendsNames.length === 0 || currentLevel >= this._maxLevel) {
            return friendsArray;
        }

        return friendsArray.concat(
            this._getArrayForIterator(
                nextFriendsNames,
                workedFriendsNames.concat(nextFriendsNames),
                currentLevel + 1
            )
        );
    };

    return LimitedIterator;
}());

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.isValid = function () {
        return true;
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

exports.Iterator = IteratorClass;
exports.LimitedIterator = LimitedIteratorClass;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
