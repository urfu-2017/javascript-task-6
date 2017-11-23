'use strict';

/**
 * Возвращает результат сравнения двух друзей по имени
 * @param {Object} friend1 - Друг 1
 * @param {Object} friend2 - Друг 2
 * @returns {Number}
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
 * Возвращает подмножество друзей, которых ещё не пригласили
 * @param {Array} friendsToFind - Друзья, которых мы ищем
 * @param {Array} invitedFriends - Список приглашённых
 * @returns {Array}
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
    if (maxLevel === 0) {
        return invitedFriends;
    }
    let currentLevelFriends = friends
        .filter(friend => friend.best)
        .sort(friendsSort);
    while (currentLevelFriends.length > 0 && maxLevel > 0) {
        invitedFriends = invitedFriends.concat(currentLevelFriends);
        currentLevelFriends = currentLevelFriends
            .reduce(
                (collectedFriends, friend) => collectedFriends.concat(
                    findUnvisitedFriends(friend.friends, collectedFriends)
                ),
                []
            )
            .map(name => friends.find(friend => friend.name === name));
        currentLevelFriends = findUnvisitedFriends(currentLevelFriends, invitedFriends)
            .sort(friendsSort);

        maxLevel--;
    }

    return invitedFriends.filter(filter.statement);
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
    this._index = 0;
    this._friends = this._prepare.apply(this, arguments);
}

/**
 * Возвращает следующего друга или null, если обход закончен
 * @returns {null|Object}
 */
Iterator.prototype.next = function () {

    return this.done() ? null : this._friends[this._index++];
};

/**
 * Обход завершен
 * @returns {Boolean} - Вернет true, если обход завершен
 */
Iterator.prototype.done = function () {

    return this._index === this._friends.length;
};

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends - Друзья из списка
 * @param {Filter} filter - Правило фильтра
 * @param {Number} maxLevel – Максимальный круг друзей
 */
function LimitedIterator() {
    Iterator.apply(this, arguments);
}
Object.setPrototypeOf(LimitedIterator.prototype, Iterator.prototype);

Iterator.prototype._prepare = function (friends, filter) {

    return getFriends(friends, filter);
};
LimitedIterator.prototype._prepare = function (friends, filter, maxLevel) {

    return getFriends(friends, filter, maxLevel);
};

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.statement = () => true;
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.statement = friend => friend.gender === 'male';
}
Object.setPrototypeOf(MaleFilter.prototype, Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.statement = friend => friend.gender === 'female';
}
Object.setPrototypeOf(FemaleFilter.prototype, Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
