'use strict';

function translateCirclesToNames(nameToCircle) {
    let circlesToNames = {};
    for (let name in nameToCircle) {
        if (nameToCircle[name] in circlesToNames) {
            circlesToNames[nameToCircle[name]].push(name);
        } else {
            circlesToNames[nameToCircle[name]] = [name];
        }
    }

    return circlesToNames;
}

function sortNamesInCircles(circlesToNames) {
    Object.values(circlesToNames).forEach(names => {
        names.sort();
    });
}

function findCircles(friends, maxLevel = Infinity) {
    let friendsQueue = friends.filter(friend => {
        return friend.best;
    });

    let nameToFriends = friends.reduce((accumulator, friend) => {
        accumulator[friend.name] = friend;

        return accumulator;
    }, {});

    let visitedFriends = [];

    let nameToCircle = friendsQueue.reduce((accumulator, bestFriend) => {
        accumulator[bestFriend.name] = 1;

        return accumulator;
    }, {});

    while (friendsQueue.length) {
        let friend = friendsQueue.shift();
        if (visitedFriends.includes(friend.name)) {
            continue;
        }

        friend.friends.forEach(name => {
            if (name in nameToCircle) {
                return;
            }
            nameToCircle[name] = nameToCircle[friend.name] + 1;
            friendsQueue.push(nameToFriends[name]);
        });
        visitedFriends.push(friend.name);
    }

    let circlesToNames = translateCirclesToNames(nameToCircle);
    sortNamesInCircles(circlesToNames);
    let sortedNames = concatCircles(circlesToNames, maxLevel);

    let sortedFriends = sortedNames.map(name => {
        return nameToFriends[name];
    });

    return sortedFriends;
}

function concatCircles(circlesToNames, maxLevel) {
    let sortedFriends = [];
    Object.keys(circlesToNames).sort((a, b) => a - b)
        .forEach(numberOfCurcle => {
            if (numberOfCurcle <= maxLevel) {
                sortedFriends = sortedFriends.concat(circlesToNames[numberOfCurcle]);
            }
        });

    return sortedFriends;
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('The filter must be instance of Filter');
    }

    this.sortedFriends = findCircles(friends).filter(friend => {
        return filter.filter(friend);
    });

    this.index = 0;
    this.done = function () {
        return this.index >= this.sortedFriends.length;
    };

    this.next = function () {
        if (!this.done()) {
            return this.sortedFriends[this.index++];
        }

        return null;
    };
}

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
function LimitedIterator(friends, filter, maxLevel) {
    Iterator.call(this, friends, filter);
    this.sortedFriends = findCircles(friends, maxLevel).filter(friend => {
        return filter.filter(friend);
    });
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = Filter;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.filter = function () {
        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    Filter.call(this);
    this.filter = function (friend) {
        return friend.gender === 'male';
    };
}

MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = Filter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    Filter.call(this);
    this.filter = function (friend) {
        return friend.gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = Filter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
