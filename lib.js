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
 * @this {Iterator}
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

        this._init(friends, filter);
    }

    Iterator.prototype._init = function (friends, filter) {
        this._friendsMap = friends.reduce((obj, friend) => {
            obj[friend.name] = friend;

            return obj;
        }, {});

        const bestFriendsNames = friends
            .filter(friend => friend.best)
            .map(friend => friend.name);

        this._iterableArray = this._getArrayForIterator(bestFriendsNames, bestFriendsNames)
            .filter(friendName => filter.isValid(this._friendsMap[friendName]));
    };
    Iterator.prototype._getFriendsOf = function (currentFriendsNames) {
        return currentFriendsNames
            .reduce(
                (nextFriends, friendName) =>
                    nextFriends.concat(this._friendsMap[friendName].friends),
                []
            )
            .reduce(
                (uniqueNames, friendName) => {
                    if (uniqueNames.indexOf(friendName) === -1) {
                        uniqueNames.push(friendName);
                    }

                    return uniqueNames;
                },
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

    /**
     * Возвращает следующий объект друга или null, если следующего объекта не существует
     * @returns {Object|null}
     */
    Iterator.prototype.next = function () {
        return this._friendsMap[this._iterableArray[this._currentPosition++]] || null;
    };

    /**
     * Возвращает true, если итератор достиг своего конца
     * @returns {boolean}
     */
    Iterator.prototype.done = function () {
        return this._currentPosition >= this._iterableArray.length;
    };

    return Iterator;
}());

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @this {LimitedIterator}
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
        if (this._maxLevel <= 0) {
            return [];
        }

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
exports.isStar = true;
