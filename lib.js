'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Int} maxLevel
 */
function Iterator(friends, filter, maxLevel = Infinity) {
    if (!(filter instanceof Filter)) {
        throw new TypeError();
    }

    this._queue = friendsQueueWith(friends, filter, maxLevel);
}

Iterator.prototype.done = function () {
    return this._queue.length === 0;
};

Iterator.prototype.next = function () {
    return this.done() ? null : this._queue.shift();
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
    Object.setPrototypeOf(this, Iterator.prototype);

    Iterator.call(this, friends, filter, maxLevel);
}

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.condition = () => true;
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    Object.setPrototypeOf(this, Filter.prototype);

    this.condition = friend => friend.gender === 'male';
}

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    Object.setPrototypeOf(this, Filter.prototype);

    this.condition = friend => friend.gender === 'female';
}

function friendsQueueWith(friends, filter, maxLevel) {
    let pool = friends
        .filter(friend => friend.best)
        .map(friend => {
            return { record: friend, level: 1 };
        });

    let selected = [];

    while (pool.length > 0) {
        let current = pool.shift();

        if (current.level > maxLevel) {
            break;
        }

        selected.push(current);

        let next = current.record.friends
            .filter(name => selected.concat(pool).every(friend => friend.record.name !== name))
            .map(name => {
                return {
                    record: friends.find(friend => friend.name === name),
                    level: current.level + 1
                };
            });

        pool.push(...next);
    }

    return selected
        .filter(friend => filter.condition(friend.record))
        .sort((first, second) => {
            if (first.level === second.level) {
                return first.record.name > second.record.name;
            }

            return first.level - second.level;
        })
        .map(friend => friend.record);
}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
