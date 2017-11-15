'use strict';

/**
 * Находим друга в исходном массиве по имени
 * @param {Object[]} friends
 * @param {String} friendName
 * @param {Object} currentFriend
 * @returns {Object}
 */
function getFriendByName1(friends, friendName, currentFriend) {
    for (let friend of friends) {
        if (friend.name === friendName && friend.friends.indexOf(currentFriend.name) !== -1) {
            return friend;
        }
    }

    return undefined;
}

/**
 * Находим друга в исходном массиве по имени
 * @param {Object[]} friends
 * @param {String} friendName
 * @returns {Object}
 */
function getFriendByName(friends, friendName) {
    for (let friend of friends) {
        if (friend.name === friendName) {
            return friend;
        }
    }

    return undefined;
}

/**
 * Сравниваем друзей по именам
 * @param {Object} friend1
 * @param {Object} friend2
 * @returns {Bool}
 */
function compareNames(friend1, friend2) {
    return friend1.name > friend2.name ? 1 : -1;
}

/**
 * Заполняем следующий уровень друзей
 * @param {Object[]} friends
 * @param {Object[]} friendsOnCurrentLevel
 * @param {Object[]} invitedFriends
 * @returns {Object[]}
 */
function getNextLevel(friends, friendsOnCurrentLevel, invitedFriends) {
    let nextLevel = [];
    for (let currentFriend of friendsOnCurrentLevel) {
        for (let friendName of currentFriend.friends) {
            nextLevel.push(getFriendByName1(friends, friendName, currentFriend));
        }
    }
    nextLevel = nextLevel.filter(friend =>
        getFriendByName(invitedFriends, friend.name) === undefined);

    return nextLevel;
}

function getInvitedFriends(maxLevel, friendsOnCurrentLevel, friends, invitedFriends) {
    let level = 1;
    while (level < maxLevel && friendsOnCurrentLevel.length !== 0) {
        let nextLevelFriends = getNextLevel(friends, friendsOnCurrentLevel, invitedFriends);
        nextLevelFriends = nextLevelFriends.sort(compareNames);
        level++;
        invitedFriends = invitedFriends.concat(nextLevelFriends);
        friendsOnCurrentLevel = nextLevelFriends;
    }

    return invitedFriends;
}

/**
 * Делим друзей на уровни
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel  
 * @returns {Object[]}
 */
function divideOnCircles(friends, filter, maxLevel) {
    if (!friends || !maxLevel || maxLevel < 1) {
        return [];
    }
    let bestFriends = friends.filter(friend => friend.best).sort(compareNames);
    let invitedFriends = bestFriends;
    let friendsOnCurrentLevel = bestFriends;
    if (invitedFriends.length === friends.length) {
        return invitedFriends;
    }
    invitedFriends = getInvitedFriends(maxLevel, friendsOnCurrentLevel, friends, invitedFriends);
    invitedFriends = filter.genderFilter(invitedFriends);

    return invitedFriends;
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('filter не является объектом конструктора Filter');
    }
    this.friends = divideOnCircles(friends, filter, Infinity);
    this.currentPosition = 0;
}

Iterator.prototype.done = function () {
    return this.currentPosition === this.friends.length;
};

Iterator.prototype.next = function () {
    if (!this.done()) {
        this.currentPosition += 1;

        return this.friends[this.currentPosition - 1];
    }

    return null;
};

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
    this.friends = divideOnCircles(friends, filter, maxLevel);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.gender = '';
}

Filter.prototype.genderFilter = function (friends) {
    return friends.filter(function (friend) {
        return friend.gender === this.gender || this.gender === '';
    }, this);
};

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.gender = 'male';
}

MaleFilter.prototype = Object.create(Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.gender = 'female';
}

FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
exports.isStar = true;
