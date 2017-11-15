'use strict';

const findFriendByName = (name, friends) => friends.find(friend => friend.name === name);

const findSmallArrayIdx = (friend, bigArray) => {
    for (let i = 0; i < bigArray.length; i++) {
        if (bigArray[i].includes(friend)) {
            return i;
        }
    }
};

const getLevel = (friend, bigArray) => findSmallArrayIdx(friend, bigArray);

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

const unpack = arrays =>
    arrays.reduce((acc, array) => [...acc, ...sortByLevels(array)]);


function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Not instance of filter');
    }
    this.stack = filter.smallFilter(unpack(bfs(friends)));
}

function LimitedIterator(friends, filter, maxLevel) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Not instance of filter');
    }
    this.stack = [];
    if (maxLevel > 0) {
        let arrrr = bfs(friends);
        this.stack = unpack(bfs(friends))
            .filter(element => getLevel(element, arrrr) < maxLevel);
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
