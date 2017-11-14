'use strict';

/**
* Сортировка в алфавитном порядке
*
* @param {Object} firstFriend
* @param {Object} secondFriend
*/

/**
* Возвращает объект друга из списка
*
* @param {Object[]} friends
* @param {String} name
* @returns {Object}
*/

/**
* Нахождение друзей, которых необходимо позвать на свадьбу
*
* @param {Object[]} friends
* @param {Filter} filter
* @param {Number} maxLeve
* @returns {Object[]}
*/

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
    this.alphabeticalOrder = (firstFriend, secondFriend) => {
        return firstFriend.name.localeCompare(secondFriend.name);
    };
    this.getFriend = (name) => {
        return friends.find((friend) => {
            return friend.name === name;
        });
    };
    this.invitedGuests = (maxLevel) => {
        let guests = friends.filter((friend) => {
            return friend.best;
        });
        let invitedFriends = [];
        while (maxLevel > 0 && guests.length) {
            let possibleGuests = [];
            console.info(guests);
            guests
                .sort(this.alphabeticalOrder)
                .forEach((friend) => {
                    if (!invitedFriends.includes(friend)) {
                        invitedFriends.push(friend);
                        friend.friends.forEach((name) => {
                            let invitedFriend = this.getFriend(name);
                            possibleGuests.push(invitedFriend);
                        });
                    }
                });
            guests = possibleGuests.slice(0);
            maxLevel--;
        }

        return invitedFriends.filter(function (friend) {
            return filter.suitableGender(friend);
        });
    };
    this.invitedFriends = this.invitedGuests(Infinity);
    this.currentIndex = 0;
    this.done = () => {
        return this.currentIndex === this.invitedFriends.length;
    };
    this.next = () => {
        return this.done() ? null : this.invitedFriends[this.currentIndex++];
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
    this.invitedFriends = this.invitedGuests(maxLevel);
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
