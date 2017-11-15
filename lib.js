'use strict';

const findFriendByName = (name, friends) => friends.find(friend => friend.name === name);

const sortByLevels = friends => friends.sort((a, b) => a.name.localeCompare(b.name));

const bfs = friends => {
    const friendsInLevels = [];
    const besties = friends.filter(element => element.best);
    friendsInLevels.push(besties);
    let queue = besties.slice();
    let visited = besties
        .map(friend => friend.name);
    let nextLevel = [];

    const lint = arr => arr.filter(friend => !visited.includes(friend));

    while (queue.length > 0) {
        let namesArray = queue.reduce((acc, friend) => {
            return [...acc, ...friend.friends];
        }, []);
        namesArray = lint(namesArray);
        nextLevel = namesArray.map(friend => findFriendByName(friend, friends));
        queue = nextLevel;
        visited = visited.concat(namesArray);
        // visited.push(...namesArray);
        friendsInLevels.push(nextLevel);
    }

    return friendsInLevels;
};

const unpack = (arrays, maxLevel) => {
    let arr = [];
    for (let i = 0; i < maxLevel; i++) {
        arr = arr.concat(sortByLevels(arrays[i]));
    }

    return arr;
};

function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Not instance of filter');
    }
    const levelsArray = bfs(friends);
    this.stack = filter.smallFilter(unpack(levelsArray, levelsArray.length));
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
