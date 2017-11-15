/* eslint-disable */
'use strict';

class Filter {
    isValid() {
        return true;
    }
}

const friendComparer = (x, y) => x.name.localeCompare(y.name);

class Layerer {
    constructor(friends, maxLevel) {
        this.visited = new Set;
        this.friends = friends;
        this.friendTree = Object.assign({}, ...friends.map(x => ({[x.name]: x})));
        this.layer = friends.filter(x => x.best).sort(friendComparer);
        this.maxLevel = --maxLevel;
    }

    done() {
        return !this.layer.length || this.maxLevel < 0;
    }

    next() {
        if (this.done())
            return [];
        this.layer.forEach(x => this.visited.add(x.name));
        let names = [].concat(...this.layer.map(x => x.friends));
        let uniqNames = [...new Set(names)].filter(x => !this.visited.has(x));
        let result = this.layer;
        this.layer = uniqNames.map(x => this.friendTree[x]).sort(friendComparer);
        this.maxLevel--;
        return result;
    }
}


function getAllFriends(friends, maxLevel = Number.MAX_SAFE_INTEGER) {
    let layerer = new Layerer(friends, maxLevel);
    let result = [];
    while (!layerer.done()) 
        result.push(...layerer.next());
    return result;
}

class Iterator {

    /**
    * Итератор по друзьям
    * @constructor
    * @param {Object[]} friends
    * @param {Filter} filter
    */
    constructor(friends, filter) {
        if (filter instanceof Filter) {
            this.friends = getAllFriends(friends).filter(x => filter.isValid(x));
            this.pointer = 0;
        } 
        else throw new TypeError;
    }

    done() {
        return this.pointer >= this.friends.length;
    }

    next() {
        return this.done() ? null : this.friends[this.pointer++];
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
        this.friends = getAllFriends(friends, maxLevel).filter(x => filter.isValid(x));
    }
}


class MaleFilter extends Filter {
    isValid(friend) {
        return friend.gender === 'male';
    }
}


class FemaleFilter extends Filter {
    isValid(friend) {
        return friend.gender === 'female';
    }
}


module.exports = { Iterator, LimitedIterator, Filter, MaleFilter, FemaleFilter, isStar: true };
