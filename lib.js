/* eslint-disable */
'use strict';

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
    this.friends = this.getAllFriends(friends, maxLevel, layer).filter(filter.isValid);
    this.done = () => this.friends.length <= 0;
    this.next = () => this.done() ? null : this.friends.shift();
}

Iterator.prototype.compareFriends = (alice, bob) => alice.name.localeCompare(bob.name);
Iterator.prototype.getUniqueNames = function(layer) {
    let names = [].concat(...layer.map(x => x.friends));
    return [...new Set(names)];
}
Iterator.prototype.thatWasNotInvited = result => (x => !result.map(y => y.name).includes(x));
Iterator.prototype.getFriendFromName = friends => (x => friends.find(y => y.name === x));

Iterator.prototype.getAllFriends = function(friends, maxLevel, layer, result = []) {
    if (maxLevel <= 0 || !layer.length)
        return result;
    result.push(...layer.sort(this.compareFriends));
    let names = this.getUniqueNames(layer).filter(this.thatWasNotInvited(result));
    let nextLayer = names.map(this.getFriendFromName(friends));
    return this.getAllFriends(friends, --maxLevel, nextLayer, result);
}

function Filter(gender = null) {
    this.isValid = friend => gender === null || friend.gender === gender;
}

module.exports = { Iterator, LimitedIterator: child(Iterator), isStar: true, Filter, 
    MaleFilter: child(Filter, 'male'), FemaleFilter: child(Filter, 'female') };
