'use strict';

class Iterator {
    constructor(friends, filter, maxLevel = Infinity) {
        this.currentIndex = 0;
        this.collection = this.completeCollection(friends, filter, maxLevel);
        console.info(this.collection);
    }

    next() {
        return this.done() ? null : this.collection[this.currentIndex++];
    }

    done() {
        return this.collection.length === this.currentIndex;
    }

    completeCollection(friends, filter, maxLevel) {
        let friendsMap = {};
        friends.forEach(friend => {
            friendsMap[friend.name] = friend;
        });
        let prevFriends = friends.filter(f => f.best)
            .sort((a, b) => a.name > b.name ? 1 : -1);
        let invitedFriends = [].concat(prevFriends);
        maxLevel--;
        let currentFriends = [];
        let isVisited = friend => invitedFriends.includes(friend) ||
            currentFriends.includes(friend);
        let addNewFriends = friend => {
            friend.friends.forEach(name => {
                if (!isVisited(friendsMap[name])) {
                    currentFriends.push(friendsMap[name]);
                }
            });
        };
        while (prevFriends.length > 0 && maxLevel-- > 0) {
            prevFriends.forEach(friend => {
                addNewFriends(friend);
            });
            currentFriends.sort((a, b) => a.name > b.name ? 1 : -1);
            invitedFriends.push(...currentFriends);
            prevFriends = currentFriends;
            currentFriends = [];
        }

        return invitedFriends.filter(filter.isCorrectObject);
    }
}

class LimitedIterator extends Iterator {
    constructor(friends, filter, maxLevel) {
        super(friends, filter, maxLevel);
    }
}

class Filter {
    isCorrectObject() {
        throw Error('method must be defined in child');
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

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
