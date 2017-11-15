'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends 
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Объект фильтра не является инстансом функции-конструктора Filter');
    }
    this.allGuests = getAllGuests(friends, filter).filter(guest => filter.isSelect(guest));
    this.index = 0;
}

Iterator.prototype = {
    done: function () {
        return this.index === this.allGuests.length;
    },
    next: function () {
        if (this.done()) {
            return null;
        }

        return this.allGuests[this.index++];
    }
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
        throw new TypeError('Объект фильтра не является инстансом функции-конструктора Filter');
    }
    this.allGuests = getAllGuests(friends, filter)
        .filter(guest => filter.isSelect(guest) && guest.level <= maxLevel);
    this.index = 0;
}

LimitedIterator.prototype = Iterator.prototype;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.isSelect = function (friend) {
        if (this.gender !== undefined) {
            return friend.gender === this.gender;
        }

        return true;
    };
    this.isBest = function (friend) {
        return friend.best === true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.gender = 'male';
}

MaleFilter.prototype = new Filter();

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.gender = 'female';
}

FemaleFilter.prototype = new Filter();

function getAllGuests(friends, filter) {
    let currentLevel = friends
        .filter(friend => filter.isBest(friend))
        .sort((a, b) => a.name > b.name)
        .map(friend => {
            friend.level = 1;

            return friend;
        });
    let allGuests = currentLevel;
    let level = 1;
    while (currentLevel.length !== 0) {
        level++;
        currentLevel = getCurrentLevel(currentLevel, friends, allGuests, level);
        allGuests = allGuests.concat(currentLevel);
    }

    return allGuests;
}

function getFriendsOfFriends(currentLevel, friends) {
    let guests = [];
    for (let friend of currentLevel) {
        updateGuests(friend, guests, friends);
    }

    return guests.sort((a, b) => a.name > b.name);
}

function updateGuests(friend, guests, friends) {
    for (let friendName of friend.friends) {
        let guest = friends.find(mate => mate.name === friendName);
        if (!guests.includes(guest)) {
            guests.push(guest);
        }
    }
}

function getCurrentLevel(currentLevel, friends, allGuests, level) {
    return getFriendsOfFriends(currentLevel, friends)
        .filter(guest => !allGuests.includes(guest))
        .map(friend => {
            friend.level = level;

            return friend;
        });
}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;


