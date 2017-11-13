'use strict';

function defaultSort(depths) {
    return function (a, b) {
        if (depths[a.name] < depths[b.name]) {
            return -1;
        } else if (depths[a.name] > depths[b.name]) {
            return 1;
        }
        if (a.name < b.name) {
            return -1;
        } else if (a.name > b.name) {
            return 1;
        }

        return 0;
    };
}

function getFriendsDepths(allFriends) {
    var depths = {};
    allFriends.forEach(function (friend) {
        depths[friend.name] = allFriends.length + 1;
    });
    var best = allFriends.filter(function (friend) {
        return friend.best;
    }).map(function (friend) {
        return friend.name;
    });
    var nextLevel = [];
    nextLevel = nextLevel.concat(best);
    processFriendsLevels(nextLevel, depths, allFriends);

    return depths;
}

function findByName(currentName) {
    return function (friend) {
        friend.name === currentName;
    };
}

function processFriendsLevels(nextLevel, depths, allFriends) {
    var visitedNames = [];
    var currentDepth = 0;
    while (nextLevel.length) {
        var currentLevel = nextLevel;
        currentDepth += 1;
        nextLevel = [];
        while (currentLevel.length) {
            var currentName = currentLevel.shift();
            depths[currentName] = currentDepth;
            visitedNames.push(currentName);
            var currentFriends = allFriends
                .find(findByName(currentName))
                .friends.filter(function (friendName) {
                    return !visitedNames.includes(friendName);
                });
            nextLevel = nextLevel.concat(currentFriends);
        }
    }
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    console.info(friends, filter);
    if (!(filter instanceof Filter)) {
        throw new TypeError();
    }
    var depths = getFriendsDepths(friends);
    this.friends = friends.filter(filter.condition)
        .sort(defaultSort(depths));
    this.filter = filter;
}
Iterator.prototype.currentIndex = 0;
Iterator.prototype.bestWereIterated = false;
Iterator.prototype.next = function () {
    this.currentIndex += 1;
    if (this.currentIndex > this.friends.length) {
        return null;
    }

    return this.friends[this.currentIndex - 1];
};
Iterator.prototype.done = function () {
    var oldIndex = this.currentIndex;
    var done = this.next() === null;
    this.currentIndex = oldIndex;

    return done;
};
LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = Iterator;

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
function LimitedIterator(friends, filter, maxLevel) {
    console.info(friends, filter, maxLevel);
    var depths = getFriendsDepths(friends);
    this.friends = friends.filter(function (friend) {
        return depths[friend.name] <= maxLevel &&
            filter.condition(friend);
    }).sort(defaultSort(depths));
    this.filter = filter;
}

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    console.info('Filter');
}

Filter.prototype.condition = function () {
    return true;
};

MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;
FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    console.info('MaleFilter');
    this.condition = function (item) {
        return item.gender === 'male';
    };
}

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    console.info('FemaleFilter');
    this.condition = function (item) {
        return item.gender === 'female';
    };
}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
