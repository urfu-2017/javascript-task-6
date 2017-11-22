'use strict';

function compareNames(friend1, friend2) {
    if (friend1.name === friend2.name) {
        return 0;
    }

    return friend1.name > friend2.name ? -1 : 1;
}

function personIsFriendForCompany(person, company) {
    var isFriend = false;
    for (var i = 0; i < company.length; i++) {
        if (company[i].friends.includes(person.name)) {
            isFriend = true;
        }
        if (person.name === company[i].name) {
            return false;
        }
    }

    return isFriend;
}

function findFirstCircle(friends) {
    return friends
        .filter(friend => friend.best)
        .sort(compareNames);
}

function addNextCircle(friends, previousCircles) {
    return friends
        .filter(person => personIsFriendForCompany(person, previousCircles))
        .sort(compareNames)
        .concat(previousCircles);
}

function findCircles(friends, condition, maxCircle = Infinity) {
    if (maxCircle < 1) {
        return [];
    }

    var previousCircles = findFirstCircle(friends);
    var nextCircles = addNextCircle(friends, previousCircles);
    while (nextCircles.length !== previousCircles.length && maxCircle > 1) {
        previousCircles = nextCircles;
        nextCircles = addNextCircle(friends, previousCircles);
        maxCircle--;
    }

    return previousCircles.filter(condition);
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Not instance of Filter');
    }
    this.guests = this._prepare.apply(this, arguments);
}

Iterator.prototype.done = function () {
    return this.guests.length === 0;
};

Iterator.prototype.next = function () {
    return this.done() ? null : this.guests.pop();
};

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
function LimitedIterator() {
    Iterator.apply(this, arguments);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);

Iterator.prototype._prepare = function (friends, filter) {
    return findCircles(friends, filter.condition, Infinity);
};

LimitedIterator.prototype._prepare = function (friends, filter, maxLevel) {
    return findCircles(friends, filter.condition, maxLevel);
};

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.condition = () => true;
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.condition = friend => friend.gender === 'male';
}

MaleFilter.prototype = Object.create(Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.condition = friend => friend.gender === 'female';
}

FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
