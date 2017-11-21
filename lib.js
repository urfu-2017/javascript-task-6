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
    const iterations = queue.length;

    for (let i = 0; i < iterations; i++) {
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

function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Not instance of filter');
    }
    const invitedFrineds = bfs(friends);
    this.stack = filter.smallFilter(unpack(invitedFrineds, invitedFrineds.length));
}

function LimitedIterator(friends, filter, maxLevel) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Not instance of filter');
    }
    this.stack = [];
    if (maxLevel > 0) {
        this.stack = unpack(bfs(friends), maxLevel);
        this.stack = filter.smallFilter(this.stack);
    }
}

function Filter() {
    this.smallFilter = friends => friends;
}

function MaleFilter() {
    this.smallFilter = friends => this.bigFilter(friends, 'gender', 'male');
}

function FemaleFilter() {
    this.smallFilter = friends => this.bigFilter(friends, 'gender', 'female');
}

Object.setPrototypeOf(FemaleFilter.prototype, Filter.prototype);
Object.setPrototypeOf(MaleFilter.prototype, Filter.prototype);
Object.setPrototypeOf(LimitedIterator.prototype, Iterator.prototype);

Object.assign(Filter.prototype, {
    bigFilter(friends, param, value) {
        return friends.filter(friend => friend[param] === value);
    }
});

Object.assign(Iterator.prototype, {
    done() {
        return this.stack.length === 0;
    },
    next() {
        if (this.stack.length > 0) {
            return this.stack.shift();
        }

        return null;
    }
});

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
