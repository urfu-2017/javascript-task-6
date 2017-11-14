'use strict';
let parents = [];

const findFriendByName = (name, friends) => {
    for (let i = 0; i < friends.length; i++) {
        if (friends[i].name === name) {
            return friends[i];
        }
    }
};

const getIdx = name => {
    for (let i = 0; i < parents.length; i++) {
        if (parents[i].name === name) {
            return i;
        }
    }
};

const findFriend = name => {
    for (let i = 0; i < parents.length; i++) {
        if (parents[i].name === name) {
            return parents[i];
        }
    }
};

const clearParents = friends => {
    const parentsCopy = parents.slice();
    parentsCopy.forEach(friend => {
        if (friend.parent === null && !findFriendByName(friend.name, friends).best) {
            parents.splice(getIdx(friend.name), 1);
        }
    });
};

const createParents = friends => {
    friends.forEach(element => {
        if (getIdx(element.name) === undefined) {
            parents.push({ name: element.name, parent: null, gender: element.gender });
        }
    });
    const besties = friends.filter(element => element.best);
    let queue = besties.slice();
    let visited = besties.slice();

    while (queue.length > 0) {
        const current = queue.shift();
        current.friends.forEach(element => {
            let currentFriend = findFriendByName(element, friends);
            if (!visited.includes(currentFriend)) {
                parents.forEach(child => {
                    if (child.name === currentFriend.name) {
                        child.parent = current;
                    }
                });
                queue.push(currentFriend);
                visited.push(currentFriend);
            }
        });
    }
    // clearParents(friends);
};

const getParent = friend => {
    if (friend && parents[getIdx(friend.name)]) {
        return parents[getIdx(friend.name)].parent;
    }

    return null;
};

const countParents = friend => {
    let counter = 1;
    while (getParent(friend) !== null) {
        counter++;
        friend = findFriend(getParent(friend).name);
    }

    return counter;
};

const getLevel = friend => countParents(friend);

const sortByLevels = friends => friends
    .sort((a, b) => (getLevel(a) - getLevel(b) ||
        a.name.localeCompare(b.name)));

function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Not instance of filter');
    }
    createParents(friends);
    this.stack = sortByLevels(filter.smallFilter(friends));
    // .map(friend => friends.find(f => f.name === friend.name));
}

function LimitedIterator(friends, filter, maxLevel) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Not instance of filter');
    }
    this.stack = [];
    if (maxLevel > 0) {
        createParents(friends);
        this.stack = sortByLevels(filter.smallFilter(friends))
            .filter(element => getLevel(element) <= maxLevel);
        // .map(friend => friends.find(f => f.name === friend.name));
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

Iterator.prototype.done = function () {
    return this.stack.length === 0;
};

Iterator.prototype.next = function () {
    if (this.stack.length > 0) {
        return this.stack.shift();
    }

    return null;
};

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
