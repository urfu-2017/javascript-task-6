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
    this.invitedFriends = this.invitedGuests(filter, friends, Infinity);
    this.currentIndex = 0;
}

Iterator.prototype.done = function () {
    return this.currentIndex === this.invitedFriends.length;
};

Iterator.prototype.next = function () {
    return this.done() ? null : this.invitedFriends[this.currentIndex++];
};

Iterator.prototype.alphabeticalOrder = (firstFriend, secondFriend) => {
    return firstFriend.name.localeCompare(secondFriend.name);
};

Iterator.prototype.getFriend = (friends, name) => {
    return friends.find((friend) => {
        return friend.name === name;
    });
};

Iterator.prototype.invitedGuests = function (filter, friends, maxLevel) {
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
                        let invitedFriend = this.getFriend(friends, name);
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
    this.invitedFriends = this.invitedGuests(filter, friends, maxLevel);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.gender = this.suitableGender();
}

Filter.prototype.suitableGender = () => true;

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.suitableGender = (friend) => friend.gender === 'male';
}

MaleFilter.prototype = Object.create(Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */

function FemaleFilter() {
    this.suitableGender = (friend) => friend.gender === 'female';

}

FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
