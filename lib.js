'use strict';

/**
 * Фильтр друзей
 * @constructor
 */
class Filter {
    constructor(gender) {
        if (gender) {
            this.filterFunc = function (friend) {
                return friend.gender === gender;
            };
        } else {
            this.filterFunc = function () {
                return true;
            };
        }
    }
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
class MaleFilter extends Filter {
    constructor() {
        super('male');
    }
}

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
class FemaleFilter extends Filter {
    constructor() {
        super('female');
    }
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
class Iterator {
    constructor(friends, filter, maxLevel) {
        if (!maxLevel) {
            maxLevel = Infinity;
        }
        if (!(filter instanceof Filter)) {
            throw new TypeError('!Filter');
        }
        // friends = массив приглашенных друзей, friendsCount - индекс для обхода
        this.friends = getFriends(friends, filter, maxLevel); // Т.к. Инфинити > 0 всегда 
        this.friendsCount = 0;
    }
    done() {
        if (this.friendsCount >= this.friends.length) { // Если индекс превысил кол-во людей
            return true;
        }

        return false;
    }
    next() {
        if (!this.done()) {
            let i = this.friendsCount;
            this.friendsCount += 1;

            return this.friends[i];
        }

        return null;
    }
}

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
class LimitedIterator extends Iterator {
    constructor(friends, filter, maxLevel) {
        super(friends, filter, maxLevel);
    }
}

function getFriends(friends, filter, maxLevel) {
    let inviteFriends = []; // Массив всех найденных друзей, еще без фильтрации, потенциальные
    let circle = friends.filter((friend) => { // Создаю первый круг - лучшие друзья
        return friend.best;
    });
    // Пока кол-во кругов позволяет и круг родитель не пустой начинаю 
    while (maxLevel > 0 && circle.length) {
        circle.sort((f1, f2) => { // Сортирую по алфавиту
            return f1.name > f2.name;
        });
        inviteFriends = inviteFriends.concat(circle); // Плюсую найденный круг
        circle = createCircleNew(circle, friends, inviteFriends); // Создаю новый
        maxLevel -= 1;
    }
    // Теперь фильтрую по заданому фильтру
    inviteFriends = inviteFriends.filter((f)=>filter.filterFunc(f));

    return inviteFriends;
}
// Функция поиска человека-объекта по имени
function findByName(friends, name) {
    for (let i = 0; i < friends.length; i++) {
        if (friends[i].name === name) {
            return friends[i];
        }
    }

    return null;
}
// Проверка, нет ли человека уже в списке потенциально-приглашенных
function alreadyAddFriend(inviteFriends, name) {
    for (let i = 0; i < inviteFriends.length; i++) {
        if (inviteFriends[i].name === name) {
            return true;
        }
    }

    return false;
}
// Создание нового круга основываясь на предыдущих функциях
function createCircleNew(circle, friends, inviteFriends) {
    let circleNew = [];
    circle.forEach((person) => {
        person.friends.forEach((name) => {
            if (!alreadyAddFriend(inviteFriends, name)) {
                let friend = findByName(friends, name);
                circleNew.push(friend);
            }
        });
    });

    return circleNew;
}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
