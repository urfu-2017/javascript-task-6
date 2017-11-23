'use strict';
/* eslint no-loop-func:  */

function sortNames(name1, name2) {
    if (name1.toLowerCase() < name2.toLowerCase()) {
        return -1;
    }
    if (name1.toLowerCase() > name2.toLowerCase()) {
        return 1;
    }

    return 0;
}
function sortByNames(friend1, friend2) {
    if (friend1.name.toLowerCase() < friend2.name.toLowerCase()) {
        return -1;
    }
    if (friend1.name.toLowerCase() > friend2.name.toLowerCase()) {
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
        this.inviteList = this.getInviteList();
    }
    findFriend(name) {
        return this.friendList.find(friend => friend.name === name);
    }
    getInviteList() {
        let toInvite = this.friendList.filter(friend => friend.best);
        let i = 0;
        while (toInvite[i]) {
            toInvite[i].friends.sort(sortNames).forEach(function (name) {
                let friend = this.findFriend(name);
                if (!isInvited(friend)) {
                    toInvite.push(friend);
                }
            }.bind(this));
            i++;
        }
        function isInvited(friend) {
            return toInvite.includes(friend);
        }

        return toInvite.filter(this.filter.check);
    }
    done() {
        return !this.inviteList.length;
    }
    next() {
        return this.inviteList.length ? this.inviteList.shift() : null;
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
        this.inviteList = this.getInviteList(maxLevel);
    }

    getInviteList(maxLevel) {
        let nextWave = [];
        let currentWave = this.friendList.filter(friend => friend.best);
        let toInvite = [...currentWave];
        let i = 0;
        while (i < maxLevel - 1) {
            currentWave.forEach(person => person.friends.sort(sortNames).forEach(function (name) {
                let friend = this.findFriend(name);
                if (!isInvited(friend)) {
                    nextWave.push(friend);
                }
            }.bind(this)));
            toInvite.push(...nextWave);
            currentWave = [...nextWave];
            nextWave = [];
            i++;
        }
        function isInvited(friend) {
            return toInvite.includes(friend);
        }

        return toInvite.filter(this.filter.check);
    }
}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
