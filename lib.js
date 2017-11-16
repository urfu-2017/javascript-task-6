/* eslint-disable */
'use strict';

const friendComparer = (x, y) => x.name.localeCompare(y.name);

function getAllFriends(friendMap, maxLevel, layer, result = []) {
    if (maxLevel <= 0)
        return result;
    result.push(...layer.sort(friendComparer));
    let visited = new Set(result.map(x => x.name));
    let names = [].concat(...layer.map(x => x.friends));
    names = [...new Set(names)].filter(x => !visited.has(x));
    let nextLayer = names.map(x => friendMap[x]);
    return names.length ? getAllFriends(friendMap, maxLevel - 1, nextLayer, result) : result;
}

class Iterator {
    constructor(friends, filter, maxLevel = Number.MAX_SAFE_INTEGER) {
        if (filter instanceof Filter) {
            let friendMap = Object.assign({}, ...friends.map(x => ({[x.name]: x})));
            let layer = friends.filter(x => x.best);
            this.friends = getAllFriends(friendMap, maxLevel, layer).filter(x => filter.isValid(x));
            this.pointer = 0;
            this.done = () => this.pointer >= this.friends.length;
            this.next = () => this.done() ? null : this.friends[this.pointer++];
        } 
        else throw new TypeError;
    }
}

class Filter {
    isValid(friend) {
        return true;
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

module.exports = { Iterator, LimitedIterator: Iterator, Filter, MaleFilter, FemaleFilter, isStar: true };
