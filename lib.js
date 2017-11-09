'use strict';

/**
* Сортировка в алфавитном порядке
*
* @param {Object} firstFriend
* @param {Object} secondFriend
*/

function alphabeticalOrder(firstFriend, secondFriend) {
    return firstFriend.name.localeCompare(secondFriend.name);
}

/**
* Возвращает объект друга из списка
*
* @param {Object[]} friends
* @param {String} name
* @returns {Object}
*/

function getFriend(friends, name) {
    return friends.find((friend) => {
        return friend.name === name;
    });
}

/**
* Нахождение друзей, которых необходимо позвать на свадьбу
*
* @param {Object[]} friends
* @param {Filter} filter
* @param {Number} maxLeve
* @returns {Object[]}
*/

function invitedGuests(friends, filter, maxLevel) {
    let guests = friends.filter((friend) => {
        return friend.best;
    });
    let invitedFriends = [];
    while (maxLevel && guests.length) {
        let possibleGuests = [];
        guests
            .sort(alphabeticalOrder)
            .forEach((friend) => {
                if (!invitedFriends.includes(friend)) {
                    invitedFriends.push(friend);
                    friend.friends.forEach((name) => {
                        let invitedFriend = getFriend(friends, name);
                        possibleGuests.push(invitedFriend);
                    });
                }
            });
        guests = possibleGuests;
        maxLevel--;
    }

    return invitedFriends.filter(function (friend) {
        return filter.suitableGender(friend);
    });
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */

function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('unknow filter');
    }
    this.currentIndex = 0;
    this.invitedGuests = invitedGuests(friends, filter, Infinity);
    this.done = () => {
        return this.currentIndex === this.invitedGuests.length;
    };
    this.next = () => {
        return this.done() ? null : this.invitedGuests[this.currentIndex++];
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
    this.invitedGuests = invitedGuests(friends, filter, maxLevel);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.suitableGender = () => {
        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.suitableGender = (friend) => {
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
    this.suitableGender = (friend) => {
        return friend.gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
