'use strict';

let friendsSortRule = (first, second) => first.name.localeCompare(second.name);

/**
 * Подготовка списка друзей, которых Билли пригласит на свадьбу.
 * @param {Object[]} friends – список друзей из блокнота Билли.
 * @param {Filter} filter – фильтр для друзей.
 * @param {Number} maxLevel – максимальный круг друзей.
 * @returns {Object[]} – отфильрованный и отсортированный список приглашаемых друзей.
 */
function collectInvitedFriends(friends, filter, maxLevel = Infinity) {
    let invitedFriends = [];

    let currentLevelFriends = friends.filter(friend => friend.best).sort(friendsSortRule);
    invitedFriends.splice(invitedFriends.length, 0, ...currentLevelFriends);

    let currentLevelIndex = 1;
    while (currentLevelIndex < maxLevel && currentLevelFriends.length > 0) {
        // 1. Собираем имена друзей следующего круга
        // 2. Получаем объекты этих друзей
        // 3. Оставляем только уникальных в списке и не приглашённых ранее
        // 4. Сортируем друзей текущего круга в алфавитном порядке
        let nextLevelFriends = currentLevelFriends
            .reduce((acc, friend) => acc.concat(friend.friends), [])
            .map(friendName => friends.find(friend => friend.name === friendName))
            .filter((friend, pos, arr) => {
                return !invitedFriends.includes(friend) && arr.indexOf(friend) === pos;
            })
            .sort(friendsSortRule);

        currentLevelIndex++;
        currentLevelFriends = nextLevelFriends;
        invitedFriends.splice(invitedFriends.length, 0, ...currentLevelFriends);
    }

    return filter.filter(invitedFriends);
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError();
    }

    this.currentGuestIndex = 0;
    this.invitedGuests = collectInvitedFriends(friends, filter);
}

/**
 * Итерация по приглашаемым друзьям.
 * @returns {null|Object} null если обход закончен иначе объект описывающий друга.
 */
Iterator.prototype.next = function () {
    return this.done() ? null : this.invitedGuests[this.currentGuestIndex++];
};

/**
 * Проверка завершения обхода.
 * @returns {boolean} true, если обход закончен, и false в противном случае.
 */
Iterator.prototype.done = function () {
    return this.currentGuestIndex === this.invitedGuests.length;
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
    Object.getPrototypeOf(LimitedIterator.prototype).constructor.call(this, friends, filter);
    this.invitedGuests = collectInvitedFriends(friends, filter, maxLevel);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.condition = () => true;
}

/**
 * Фильтрация приглашаемых гостей по заданному критерию.
 * @param {Object[]} friends – список гостей.
 * @returns {Object[]} – отфильтрованный по критерию список гостей.
 */
Filter.prototype.filter = function (friends) {
    return friends.filter(this.condition);
};

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.condition = friend => friend.gender === 'male';
}

MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.condition = friend => friend.gender === 'female';
}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
