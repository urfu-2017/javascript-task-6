'use strict';

/**
 * Фильтр друзей
 * @constructor
 */
class Filter {
    constructor(gender) {
        this._gender = gender;
    }

    check(friend) {
        return friend.gender === this._gender;
    }
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
class MaleFilter extends Filter {
    constructor() {
        super('male');
    }
}

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
class FemaleFilter extends Filter {
    constructor() {
        super('female');
    }
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
class Iterator {
    constructor(friends, filter) {
        if (!(filter instanceof Filter)) {
            throw new TypeError();
        }
        this._init(...arguments);
    }

    _init(friends, filter, maxLevel) {
        this._filter = filter;
        this._friendsGenerator = _iterFriends(
            friends, maxLevel ? maxLevel : Infinity);
        this._current = this._nextFiltered(friends);
    }

    done() {
        return this._current.done;
    }

    next() {
        if (this.done()) {
            return null;
        }
        const result = this._current;
        this._current = this._nextFiltered();

        return result.value;
    }

    _nextFiltered() {
        let result;
        do {
            const next = this._friendsGenerator.next();
            if (next.done || this._filter.check(next.value)) {
                result = next;
            }
        } while (!result);

        return result;
    }
}

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
class LimitedIterator extends Iterator {
    constructor(friends, filter, maxLevel) {
        super(friends, filter, maxLevel < 0 ? 0 : maxLevel);
    }
}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;


const _getFriendsByNames = (friends) =>
    new Map(friends.map(f => [f.name, f]));


const _getNextCircle = (friends, friendsByNames, visited) =>
    friends.map(f => f.friends)
        .filter(Boolean)
        .reduce((acc, curr) => acc.concat(curr), [])
        .filter(fName => !visited.has(fName) && visited.add(fName))
        .sort()
        .map(fName => friendsByNames.get(fName));


function* _iterFriends(friends, maxCircle) {
    const friendsByNames = _getFriendsByNames(friends);
    const visited = new Set();
    const billy = {
        name: 'Billy',
        friends: friends.filter(f => f.best)
            .map(f => f.name)
    };
    let circleNum = 0;
    let currentCircle = [billy];
    do {
        currentCircle = _getNextCircle(currentCircle, friendsByNames, visited);
        yield* currentCircle;
        circleNum += 1;
    } while (circleNum < maxCircle && currentCircle.length > 0);
}
