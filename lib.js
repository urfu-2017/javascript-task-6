'use strict';


function getFriends(friends, filter) {
    var friendsToInvite;
    friendsToInvite = friends.filter(filter.filterF);

    return friendsToInvite;
}

function collectAllFrineds(storage, friend) {
    var friendsToAdd = friend.friends;
    for (var q = 0; q < friendsToAdd.length; q ++) {
        if (!storage.includes(friendsToAdd[q])) {
            storage.push(friendsToAdd[q]);
        }
    }

    return storage;
}

function getFriendByName(friends, name) {
    for (var fr = 0; fr < friends.length; fr++) {
        if (friends[fr].name === name) {
            return friends[fr];
        }
    }
}

function getFriendsUpToLvl(friends, lvl) { // eslint-disable-line max-statements
    var bestFriends = friends.filter(function (friend) {
        return friend.best === true;
    });
    bestFriends.sort(function (a, b) {
        return a.name > b.name;
    });
    if (lvl === 1) {
        return bestFriends;
    }
    var friendsUpToLvl = bestFriends;
    var nextIter = [];
    for (var bFriend = 0; bFriend < bestFriends.length; bFriend++) {
        nextIter = collectAllFrineds(nextIter, bestFriends[bFriend]);
    }
    lvl -= 1;
    var addedToInspect = nextIter.length; // исключительно костыльный код
    while (lvl > 0 && addedToInspect > 0) {
        var currentToInspect = nextIter.length;
        nextIter.sort(function (a, b) {
            return a > b;
        });
        nextIter.map(function (friend) { // eslint-disable-line array-callback-return, no-loop-func
            friend = getFriendByName(friends, friend);
            if (!friendsUpToLvl.includes(friend)) {
                friendsUpToLvl.push(friend);
                nextIter = collectAllFrineds(nextIter, friend);
            }
        });
        addedToInspect = nextIter.length - currentToInspect;
        lvl -= 1;
    }

    return friendsUpToLvl;
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('not a filter!');
    }
    var allFriendsPossible = getFriendsUpToLvl(friends, Infinity);
    this.friendsToInvite = getFriends(allFriendsPossible, filter);
    this.count = 0;
    this.next = function () {
        var nextFriend = null;
        if (!this.done()) {
            nextFriend = this.friendsToInvite[this.count];
            this.count++;

            return nextFriend;
        }

        return nextFriend;
    };
    this.done = function () {
        return this.count >= this.friendsToInvite.length;
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
    if (!(filter instanceof Filter)) {
        throw new TypeError('not a filter!');
    }
    Iterator.call(this, friends, filter);
    this.count = 0;
    var allFriendsUpToLvl = getFriendsUpToLvl(friends, maxLevel);
    this.friendsToInvite = getFriends(allFriendsUpToLvl, filter);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.filterF = function () {
        return true;
    };

}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.filterF = function (friend) {
        return friend.gender === 'male';
    };
}

MaleFilter.prototype = Object.create(Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.filterF = function (friend) {
        return friend.gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
