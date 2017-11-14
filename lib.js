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

    this._friends = {};
    friends.forEach(friend => {
        this._friends[friend.name] = friend;
    });
    this._filter = filter;

    this._currentLevelFriends = friends.filter(friend => friend.best);
    this._currentLevelFriends.sort(compareFriends);

    this._visitedFriends = [];

    this._position = -1;
    this._moveNextFriend();
}

Object.assign(Iterator.prototype, {
    next() {
        if (this.done()) {
            return null;
        }
        const result = this._getCurrentFriend();
        this._moveNextFriend();

        return result;
    },
    done() {
        return this._currentLevelFriends.length === 0;
    },
    _moveNextFriend() {
        do {
            this._position++;
            if (this._position >= this._currentLevelFriends.length) {
                this._moveNextLevel();
                this._position = 0;
            }
        }
        while (!this.done() && !this._filter.match(this._getCurrentFriend()));
    },
    _moveNextLevel() {
        this._visitedFriends.push(...this._currentLevelFriends);
        this._currentLevelFriends = this._currentLevelFriends
            .map(friend => friend.friends)
            .reduce((a, b) => a.concat(b), [])
            .filter((friend, index, arr) => arr.indexOf(friend) === index)
            .map(friendName => this._friends[friendName])
            .filter(friend => !this._visitedFriends.includes(friend))
            .sort(compareFriends);
    },
    _getCurrentFriend() {
        return this._currentLevelFriends[this._position];
    }
});

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
function LimitedIterator(friends, filter, maxLevel) {
    this._maxLevels = maxLevel;
    Iterator.call(this, friends, filter);
}

Object.assign(LimitedIterator.prototype, {
    done() {
        return this._maxLevels <= 0 || Iterator.prototype.done.call(this);
    },
    _moveNextLevel() {
        this._maxLevels--;
        Iterator.prototype._moveNextLevel.call(this);
    }
});

Object.setPrototypeOf(LimitedIterator.prototype, Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.match = () => true;
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.match = friend => friend.gender === 'male';
}

Object.setPrototypeOf(MaleFilter.prototype, Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.match = friend => friend.gender === 'female';
}

Object.setPrototypeOf(FemaleFilter.prototype, Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;

function compareFriends(a, b) {
    return a.name.localeCompare(b.name);
}
