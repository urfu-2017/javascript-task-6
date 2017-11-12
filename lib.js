'use strict';

exports.isStar = true;

function sortFunc(a, b) {
    return a.name < b.name;
}

function getFriendsObjectByNames(friends, names, alreadyChecked) {
    return friends.filter((friend) => {
        return names.indexOf(friend.name) !== -1 && alreadyChecked.indexOf(friend.name) === -1;
    });
}

function getFilteredFriends(friends, filter, maxLevel = Infinity) {
    let result = [];
    let currLevel = friends.filter((friend) => {
        return friend.best;
    }).sort(sortFunc);
    let nextLevel = [];
    let alreadyChecked = [];
    while (currLevel.length && maxLevel > 0) {
        let person = currLevel.pop();
        if (filter.check(person) && alreadyChecked.indexOf(person.name) === -1) {
            result.push(person);
        }
        alreadyChecked.push(person.name);
        nextLevel = nextLevel.concat(
            getFriendsObjectByNames(friends, person.friends, alreadyChecked)
        );
        if (!currLevel.length) {
            maxLevel--;
            currLevel = nextLevel.sort(sortFunc);
            nextLevel = [];
        }
    }

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
        throw new TypeError('filter is instance of Filter');
    }
    this.pointer = 0;
    this.friends = getFilteredFriends(friends, filter);
    this.next = function () {
        if (this.done()) {
            return null;
        }

        return this.friends[this.pointer++];
    };
    this.done = function () {
        return this.pointer === this.friends.length;
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
    Object.setPrototypeOf(this, new Iterator(friends, filter));
    this.friends = getFilteredFriends(friends, filter, maxLevel);
}

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.check = function (person) {
        return Object.keys(this).every((key) => {
            if (key === 'check') {
                return true;
            }

            return person[key] === this[key];
        });
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    Object.setPrototypeOf(this, new Filter());
    this.gender = 'male';
}

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    Object.setPrototypeOf(this, new Filter());
    this.gender = 'female';
}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
