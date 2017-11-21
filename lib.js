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
    this.allGuests = getAllGuests(friends, filter).filter(guest => filter.isSelectByGender(guest));
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
        .filter(guest => filter.isSelectByGender(guest) && guest.level <= maxLevel);
    this.index = 0;
}

LimitedIterator.prototype = Iterator.prototype;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.isSelectByGender = function (friend) {
        if (this.gender) {
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
    let currentFriends = friends
        .filter(friend => filter.isBest(friend))
        .sort((a, b) => a.name > b.name)
        .map(friend => {
            friend.level = 1;

            return friend;
        });
    let allGuests = currentFriends;
    let level = 1;
    while (currentFriends.length) {
        level++;
        currentFriends = getCurrentFriends(currentFriends, friends, allGuests, level);
        allGuests = allGuests.concat(currentFriends);
    }

    return allGuests;
}

function getFriendsOfFriends(currentFriends, friends) {
    let guests = [];
    for (let friend of currentFriends) {
        addGuests(friend, guests, friends);
    }

    return guests.sort((a, b) => a.name > b.name);
}

function addGuests(friend, guests, friends) {
    for (let friendName of friend.friends) {
        let guest = friends.find(mate => mate.name === friendName);
        if (!guests.includes(guest)) {
            guests.push(guest);
        }
    }
}

function getCurrentFriends(currentFriends, friends, allGuests, level) {
    return getFriendsOfFriends(currentFriends, friends)
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
