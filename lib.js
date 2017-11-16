'use strict';
function getFriends(friends, filter, level) {

    if (level === undefined) {
        level = Infinity;
    }
    var resultFriends = [];
    var best = getBest(friends).sort(sortByName);

    resultFriends = resultFriends.concat(best);

    while (level > 1 && best.length !== 0) {
        var tempFriends = getTempFriend(best, friends, resultFriends);
        // получаем массив друзей друзей
        tempFriends = removeDuplicates(tempFriends.sort(sortByName));
        // сортируем и убираем оттуда дубликаты 
        resultFriends = resultFriends.concat(tempFriends);
        // добавляем друзей друзей в результирующий массив
        best = tempFriends;
        // обновляем массив, чтобы на след. итерации начать с них
        level --;
    }

    return resultFriends.filter(filter.checkGender);
}

function getBest(friends) {
    var best = [];
    friends.forEach(function (friend) {
        if (friend.best === true) {
            best.push(friend);
        }
    });

    return best;
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

function getTempFriend(best, friends, resultFriends) {
    var tempFriends = [];
    best.forEach(function (person) {
        person.friends.forEach(function (buddy) {
            if (noBuddy(buddy, resultFriends)) {
                tempFriends.push(getBuddyObject(buddy, friends));
            }
        });
    });

    return tempFriends;
}

function noBuddy(buddy, best) {

    var res = true;
    best.forEach(function (guy) {
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

function removeDuplicates(array) {
    var result = [];
    if (array[0] !== undefined) {
        result.push(array[0]);
    }

    array.forEach(function (friend) {
        if (friend.name !== result[result.length - 1].name) {
            result.push(friend);
        }
    });

    return result;
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
    if (maxLevel >= 1) {
        this.friendsList = getFriends(friends, filter, maxLevel);
    } else {
        this.friendsList = [];
    }

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
