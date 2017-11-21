'use strict';

const findFriendByName = (name, friends) => friends.find(friend => friend.name === name);

const sortByLevels = friends => friends.sort((a, b) => a.name.localeCompare(b.name));

const getNewFriends = (arr, visited) => arr.filter(friend => visited.indexOf(friend) === -1);

const bfs = friends => {
    const friendsInLevels = [];
    const besties = friends.filter(element => element.best);
    friendsInLevels.push(besties);
    let queue = besties.slice();
    let visited = besties.map(friend => friend.name);

    while (queue.length > 0) {
        let namesArray = queue.reduce((acc, friend) => {
            acc.push(...friend.friends);

            return acc;
        }, []);
        namesArray = getNewFriends(namesArray, visited);
        queue = namesArray.map(friend => findFriendByName(friend, friends));
        visited = visited.concat(namesArray);
        friendsInLevels.push(queue);
    }

    return friendsInLevels;
};

const unpack = (arrays, maxLevel) => {
    let arr = [];
    maxLevel = maxLevel > arrays.length ? arrays.length : maxLevel;
    for (let i = 0; i < maxLevel; i++) {
        arr = [...arr, ...(sortByLevels(arrays[i]))];
    }

    return [...new Set(arr)];
};


class Filter {
    constructor() {
        this.smallFilter = friends => friends;
    }
    bigFilter(friends, param, value) {
        return friends.filter(friend => friend[param] === value);
    }
}


class MaleFilter extends Filter {
    constructor() {
        super();
        this.smallFilter = friends => this.bigFilter(friends, 'gender', 'male');
    }
}

class FemaleFilter extends Filter {
    constructor() {
        super();
        this.smallFilter = friends => this.bigFilter(friends, 'gender', 'female');
    }
}

class Iterator {
    constructor(friends, filter) {
        if (!(filter instanceof Filter)) {
            throw new TypeError('Not instance of filter');
        }
        this.friends = friends;
        this.filter = filter;
        this._invitedFriends = bfs(friends);
        this._initialized = false;
        this.stack = [];
    }
    done() {
        if (!this._initialized) {
            this._initialize();
        }

        return this.stack.length === 0;
    }
    next() {
        if (!this._initialized) {
            this._initialize();
        }
        if (this.stack.length > 0) {
            return this.stack.shift();
        }

        return null;
    }

    _initialize(length = this._invitedFriends.length) {
        this.stack = this.filter.smallFilter(unpack(this._invitedFriends, length));
        this._initialized = true;
    }
}

class LimitedIterator extends Iterator {
    constructor(friends, filter, maxLevel) {
        super(friends, filter);
        this.maxLevel = maxLevel;
        this._initialized = true;
        if (maxLevel > 0) {
            this._initialize(maxLevel);
        }
    }
}


exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
