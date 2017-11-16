'use strict';
/* eslint no-loop-func:  */

function sortByNames(friend1, friend2) {
    if (friend1.name < friend2.name) {
        return -1;
    }
    if (friend1.name > friend2.name) {
        return 1;
    }

    return 0;
}

/**
 * Фильтр друзей
 * @constructor
 */
class Filter {
    check(filter, friend) {
        return filter(friend);
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
        this.friendList = friends.sort(sortByNames);
        this.filter = filter;
        this.unchecked = friends.filter(friend => !friend.best);
        this.forFilter = this.getWaves();
    }
    isChecked(friend) {
        return this.unchecked.indexOf(friend) === -1;
    }
    check(friend) {
        this.unchecked.splice(this.unchecked.indexOf(friend), 1);
    }
    findFriend(name) {
        return this.friendList.find(friend => friend.name === name);
    }
    getWaves() {
        let waves = this.friendList.filter(friend => friend.best);
        let i = 0;
        while (waves[i]) {
            waves[i].friends.sort().forEach(function (name) {
                let friend = this.findFriend(name);
                let checked = this.isChecked(friend);
                if (!checked) {
                    this.check(friend);
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
        let wave = this.friendList.filter(friend => friend.best);
        let waves = [...wave];
        let i = 0;
        while (i < maxLevel - 1) {
            wave.forEach(person => person.friends.sort().forEach(function (name) {
                let friend = this.findFriend(name);
                let checked = this.isChecked(friend);
                if (!checked) {
                    this.check(friend);
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

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
