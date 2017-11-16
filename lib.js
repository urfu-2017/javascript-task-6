'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */

function findGuests(friends, filter, maxLevel) {
    let guests = [];
    let invited = friends.filter(friend => friend.best);
    while (maxLevel > 0 && invited.length !== 0) {
        let count = invited.length;
        invited
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach((friend) => {
                if (!guests.includes(friend)) {
                    guests.push(friend);
                    friend.friends.forEach((subfriend) => {
                        let invite = friends.find(person => person.name === subfriend);
                        invited.push(invite);
                    });
                }
            });
        invited.splice(0, count);
        maxLevel--;
    }

    return guests.filter((friend) => filter.filterGender(friend));
}

class Iterator {
    constructor(friends, filter) {
        this.numberСycle = 0;
        this.guests = findGuests(friends, filter, Infinity);
        this.done = () => {
            return this.numberСycle === this.guests.length;
        };
        this.next = () => {
            return this.done() ? null : this.guests[this.numberСycle++];
        };
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
        super(friends, filter, maxLevel);
        this.maxLevel = maxLevel;
        this.guests = findGuests(friends, filter, maxLevel);
    }
}

/**
 * Фильтр друзей
 * @constructor
 */
class Filter {
    constructor() {
        this.filterGender = () => {
            return true;
        };
    }
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
class MaleFilter extends Filter {
    constructor() {
        super();
        this.filterGender = (friend) => {
            return friend.gender === 'male';
        };
    }
}

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
class FemaleFilter extends Filter {
    constructor() {
        super();
        this.filterGender = (friend) => {
            return friend.gender === 'female';
        };
    }
}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
