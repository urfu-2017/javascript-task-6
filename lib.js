'use strict';
function getFriends(friends, filter, level) {
    if (level === undefined) {
        level = friends.length + 10;// +10 на всякий случай
    }
    var resultFriends = [];
    var best = [];
    friends.forEach(function (friend) {
        if (friend.best === true) {
            best.push(friend);
        }
    });
    best = best.sort(sortByName);

    resultFriends = resultFriends.concat(best);

    while (level > 1 && resultFriends.length !== friends.length) {
        var tempFriends = getTempFriend(resultFriends, friends);
        tempFriends = tempFriends.sort(sortByName);
        resultFriends = resultFriends.concat(tempFriends);
        level --;
        tempFriends = [];

    }

    return resultFriends.filter(filter.checkGender);
}

function sortByName(a, b) {
    if (a.name > b.name) {
        return 1;
    }
    if (a.name < b.name) {
        return -1;
    }

    return 0;
}

function getTempFriend(resultFriends, friends) {
    var tempFriends = [];
    resultFriends.forEach(function (person) {
        person.friends.forEach(function (buddy) {
            if (noBuddy(buddy, resultFriends)) {
                tempFriends.push(getBuddyObject(buddy, friends));
            }
        });
    });

    return tempFriends;
}

function noBuddy(buddy, resultFriends) {

    var res = true;
    resultFriends.forEach(function (guy) {
        if (guy.name === buddy) {
            res = false;
        }
    });

    return res;
}

function getBuddyObject(buddy, friends) {
    var frnd = {};
    friends.forEach(function (friend) {
        if (friend.name === buddy) {
            frnd = friend;
        }
    });

    return frnd;

}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('ты прислал мне какую-то дичь');
    }
    this.friendsList = getFriends(friends, filter);
    this.i = 0;
}

Iterator.prototype.done = function () {
    if (this.i === this.friendsList.length) {
        return true;
    }

    return false;
};

Iterator.prototype.next = function () {
    if (!this.done()) {
        return this.friendsList[this.i++];
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
    if (!(filter instanceof Filter)) {
        throw new TypeError('ты прислал мне какую-то дичь');
    }
    this.friendsList = getFriends(friends, filter, maxLevel);
    this.i = 0;
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    console.info('Filter');
    this.checkGender = function () {
        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    console.info('MaleFilter');
    this.checkGender = function (someone) {
        return someone.gender === 'male';
    };
}

MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    console.info('FemaleFilter');
    this.checkGender = function (someone) {
        return someone.gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
