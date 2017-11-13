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
    this._resultStack = [];
    let previousSize = -1;
    let invitedFriends = new Set(friends.filter(
        friend => friend.hasOwnProperty('best')).sort(this._sorter));
    let currentLevel = [...invitedFriends];
    while (previousSize !== invitedFriends.size) {
        previousSize = invitedFriends.size;
        const newProps = this._fillLevel(friends, invitedFriends, currentLevel);
        invitedFriends = newProps[0];
        currentLevel = newProps[1];
    }
    this._resultStack = filter.filter([...invitedFriends]);
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
    if (!(filter instanceof Filter)) {
        throw new TypeError();
    }
    this._resultStack = [];
    if (maxLevel > 0) {
        let invitedFriends = new Set(friends
            .filter(friend => friend.best)
            .sort(this._sorter));
        let currentLevel = [...invitedFriends];
        for (let i = 1; i < maxLevel; i++) {
            const newProps = this._fillLevel(friends, invitedFriends, currentLevel);
            invitedFriends = newProps[0];
            currentLevel = newProps[1];
        }
        this._resultStack = filter.filter([...invitedFriends]);
    }
}

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.filter = function (friends) {
        return friends;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.filter = function (friends) {
        return this.mainFilter(friends, 'gender', 'male');
    };
}

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.filter = function (friends) {
        return this.mainFilter(friends, 'gender', 'female');
    };
}

Object.setPrototypeOf(MaleFilter.prototype, Filter.prototype);
Object.setPrototypeOf(FemaleFilter.prototype, Filter.prototype);
Object.setPrototypeOf(LimitedIterator.prototype, Iterator.prototype);

Object.assign(Filter.prototype, {
    mainFilter(friends, field, value) {
        return friends.filter(friend => friend[field] === value);
    }
});

Object.assign(Iterator.prototype, {
    next() {
        return this._resultStack.length > 0 ? this._resultStack.shift() : null;
    },
    done() {
        return !this._resultStack.length > 0;
    },
    _sorter(a, b) {
        if (a.hasOwnProperty('best') && b.hasOwnProperty('best')) {
            return a.name.localeCompare(b.name);
        }
        if (a.hasOwnProperty('best')) {
            return -1;
        }
        if (b.hasOwnProperty('best')) {
            return 1;
        }

        return a.name.localeCompare(b.name);
    },
    _fillLevel(friends, invitedFriends, currentLevel) {
        const friendsOfFriendsNames = new Set(currentLevel.reduce(
            (acc, friend) => [...acc, ...friend.friends], []));
        currentLevel = [];
        appendLowerLevelFriends(friendsOfFriendsNames, this._sorter);

        function appendLowerLevelFriends(names, sorter) {
            names.forEach(friendName => {
                currentLevel.push(friends.find(friend => friend.name === friendName));
            });
            invitedFriends = new Set([...invitedFriends, ...currentLevel.sort(sorter)]);
        }

        return [invitedFriends, currentLevel];
    }
});

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
