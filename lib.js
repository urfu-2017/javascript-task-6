/* eslint-disable */
'use strict';

const friendComparer = (x, y) => x.name.localeCompare(y.name);

function getAllFriends(friends, maxLevel, layer, result = []) {
    if (maxLevel <= 0 || !layer.length)
        return result;
    result.push(...layer.sort(friendComparer));
    let names = [].concat(...layer.map(x => x.friends));
    names = [...new Set(names)].filter(x => !result.map(y => y.name).includes(x));
    let nextLayer = names.map(x => friends.find(y => y.name === x));
    return getAllFriends(friends, --maxLevel, nextLayer, result);
}

function child(superClass, ...injectedArgs) {
    let child = function(...args) {
        superClass.call(this, ...args, ...injectedArgs);
    };
    child.prototype = Object.assign(Object.create(superClass.prototype), { constructor: child });
    return child;
}

function Iterator(friends, filter, maxLevel = Number.MAX_SAFE_INTEGER) {
    if (!(filter instanceof Filter))
        throw new TypeError;
    let layer = friends.filter(x => x.best);
    this.friends = getAllFriends(friends, maxLevel, layer).filter(filter.isValid);
    this.pointer = 0;
    this.done = () => this.pointer >= this.friends.length;
    this.next = () => this.done() ? null : this.friends[this.pointer++];
}

function Filter(gender = null) {
    this.isValid = friend => gender === null || friend.gender === gender;
}

module.exports = { Iterator, LimitedIterator: child(Iterator), isStar: true, Filter, 
    MaleFilter: child(Filter, 'male'), FemaleFilter: child(Filter, 'female') };
