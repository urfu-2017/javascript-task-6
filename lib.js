'use strict';

class Filter {
    isCorrectObject() {
        return true;
    }
}

class MaleFilter extends Filter {
    isCorrectObject(obj) {
        return obj.gender === 'male';
    }
}

class FemaleFilter extends Filter {
    isCorrectObject(obj) {
        return obj.gender === 'female';
    }
}

class Iterator {
    constructor(friends, filter, maxLevel = Infinity) {
        if (!(filter instanceof Filter)) {
            throw new TypeError();
        }
        this.currentIndex = 0;
        this.collection = this.completeCollection(friends, filter, maxLevel);
    }

    next() {
        return this.done() ? null : this.collection[this.currentIndex++];
    }

    done() {
        return this.collection.length === this.currentIndex;
    }

    completeCollection(friends, filter, maxLevel) {
        if (!maxLevel) {
            return [];
        }
        let friendsMap = {};
        friends.forEach(friend => {
            friendsMap[friend.name] = friend;
        });
        let prevFriends = friends.filter(f => f.best).sort(sortByName);
        let invitedFriends = [].concat(prevFriends);
        maxLevel--;
        let currentFriends = [];
        while (prevFriends.length > 0 && maxLevel-- > 0) {
            this._addNewFriends(prevFriends, friendsMap, invitedFriends, currentFriends);
            prevFriends = currentFriends;
            currentFriends = [];
        }

        return invitedFriends.filter(filter.isCorrectObject);
    }

    _addNewFriends(prevFriends, friendsMap, invitedFriends, currentFriends) {
        let isVisited = f => invitedFriends.includes(f) ||
            currentFriends.includes(f);
        prevFriends.forEach(friend => {
            friend.friends.forEach(name => {
                if (!isVisited(friendsMap[name])) {
                    currentFriends.push(friendsMap[name]);
                }
            });
        });
        currentFriends.sort(sortByName);
        invitedFriends.push(...currentFriends);
    }
}

function sortByName(a, b) {
    if (a.name === b.name) {
        return 0;
    }

    return a.name > b.name ? 1 : -1;
}

class LimitedIterator extends Iterator {
    constructor(friends, filter, maxLevel) {
        super(friends, filter, maxLevel);
    }
}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
