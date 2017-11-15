'use strict';

/**
 * Сортировка друзей по именам
 * @param {Object} friend1 - Друг 1
 * @param {Object} friend2 - Друг 2
 * @returns {Number} - Порядок сортировки
 */
function friendsSort(friend1, friend2) {
    let name1 = friend1.name;
    let name2 = friend2.name;
    if (name1 === name2) {
        return 0;
    }

    return (name1 > name2) ? 1 : -1; // по возрастанию

}

/**
 * Найти не приглашенных друзей
 * @param {Object} friendsToFind - Друзья, которых мы ищем
 * @param {Object} invitedFriends - Список приглашённых
 * @returns {Object} - Друзья, которых ещё не пригласили
 */
function findUnvisitedFriends(friendsToFind, invitedFriends) {

    return friendsToFind.filter(friend => !invitedFriends.includes(friend));
}

/**
 * Получить список приглашённых друзей 
 * @param {Object[]} friends - Друзья из списка
 * @param {Filter} filter - Правило фильтра
 * @param {Number} maxLevel - Максимальный круг друзей
 * @returns {Object}
 */
function getFriends(friends, filter, maxLevel = Infinity) {
    let invitedFriends = [];
    let currentLevelFriends = friends
        .filter(friend => friend.best)
        .sort(friendsSort);
    while (currentLevelFriends.length > 0 && maxLevel > 0) {
        invitedFriends = invitedFriends.concat(currentLevelFriends);
        currentLevelFriends = currentLevelFriends
            .reduce((accum, friend) => accum.concat(friend.friends), [])
            .map(name => friends.find(friend => friend.name === name));
        currentLevelFriends = findUnvisitedFriends(currentLevelFriends, invitedFriends)
            .sort(friendsSort);

        maxLevel--;
    }

    return invitedFriends.filter(filter.filter); // так наверно нельзя писать
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends - Друзья из списка
 * @param {Filter} filter - Правило фильтра
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Неправильный формат фильтра');
    }
    this.friends = getFriends(friends, filter);
}

/**
 * Следующая итерация
 * @returns {null|Object} - Вернет null, если обход закончен или Друга в противном случае 
 */
Iterator.prototype.next = function () {

    return this.done() ? null : this.friends.shift();
};

/**
 * Обход завершен
 * @returns {Boolean} - Вернет true, если обход завершен
 */
Iterator.prototype.done = function () {

    return this.friends.length === 0;
};

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends - Друзья из списка
 * @param {Filter} filter - Правило фильтра
 * @param {Number} maxLevel – Максимальный круг друзей
 */
function LimitedIterator(friends, filter, maxLevel) {
    Iterator.call(this, friends, filter);
    this.friends = getFriends(friends, filter, maxLevel);
}
Object.setPrototypeOf(LimitedIterator.prototype, Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.filter = () => true;
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.filter = friend => friend.gender === 'male';
}
Object.setPrototypeOf(MaleFilter.prototype, Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.filter = friend => friend.gender === 'female';
}
Object.setPrototypeOf(FemaleFilter.prototype, Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
