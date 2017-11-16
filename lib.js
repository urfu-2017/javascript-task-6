'use strict';
/* eslint no-loop-func:  */

/**
 * Фильтр друзей
 * @constructor
 */
class Filter {
    check(filter, friend) {
        return filter(friend);
    }
}

class Iterator {

    /**
     * Итератор по друзьям
     * @constructor
     * @param {Object[]} friends
     * @param {Filter} filter
     */
    constructor(friends, filter) {
        if (!(filter instanceof Filter)) {
            throw new TypeError();
        }
        this.friendList = friends.sort(function (friend1, friend2) {
            if (friend1.name < friend2.name) {
                return -1;
            }
            if (friend1.name > friend2.name) {
                return 1;
            }

            return 0;
        });
        this.filter = filter;
        this.unchecked = [...friends];
        this.forFilter = this.getWaves();
    }
    isChecked(friend) {
        return this.unchecked.indexOf(friend) === -1;
    }
    uncheck(friend) {
        this.unchecked.splice(this.unchecked.indexOf(friend), 1);
    }
    findFriend(name) {
        return this.friendList.find(friend => friend.name === name);
    }
    getWaves() {
        let waves = this.friendList.filter(function (friend) {
            if (friend.best) {
                this.uncheck(friend);
            }

            return friend.best;
        }.bind(this));
        let i = 0;
        while (waves[i]) {
            waves[i].friendList.forEach(function (name) {
                let friend = this.findFriend(name);
                let checked = this.isChecked(friend);
                if (!checked) {
                    this.uncheck(friend);
                    waves.push(friend);
                }
            }.bind(this));
            i++;
        }

        return waves.filter(this.filter.check);
    }
    done() {
        return !this.forFilter.length;
    }
    next() {
        return this.forFilter.length ? this.forFilter.shift() : null;
    }
}

class LimitedIterator extends Iterator {

    /**
     * Итератор по друзям с ограничением по кругу
     * @extends Iterator
     * @constructor
     * @param {Object[]} friends
     * @param {Filter} filter
     * @param {Number} maxLevel – максимальный круг друзей
     */
    constructor(friends, filter, maxLevel) {
        super(friends, filter);
        this.unchecked = [...friends];
        this.forFilter = this.getWaves(maxLevel);
    }

    getWaves(maxLevel) {
        let nextWave = [];
        let wave = this.friendList.filter(function (friend) {
            if (friend.best) {
                this.uncheck(friend);
            }

            return friend.best;
        }.bind(this));
        let waves = [...wave];
        let i = 0;
        while (i < maxLevel - 1) {
            wave.forEach(person => person.friendList.sort().forEach(function (name) {
                let friend = this.findFriend(name);
                let checked = this.isChecked(friend);
                if (!checked) {
                    this.uncheck(friend);
                    nextWave.push(friend);
                }
            }.bind(this)));
            waves.push(...nextWave);
            wave = [...nextWave];
            nextWave = [];
            i++;
        }

        return waves.filter(this.filter.check);
    }
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
class MaleFilter extends Filter {
    check(friend) {
        return friend.gender === 'male';
    }
}

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
class FemaleFilter extends Filter {
    check(friend) {
        return friend.gender === 'female';
    }
}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
