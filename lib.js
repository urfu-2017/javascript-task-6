'use strict';

function compareNames(friend1, friend2) {
    if (friend1.name === friend2.name) {
        return 0;
    }

    return friend1.name > friend2.name ? -1 : 1;
}

function personIsFriendForCompany(person, company) {
    var isFriend = false;
    var isMember = false;
    company.forEach(function (companyMember) {
        if (companyMember.friends.includes(person.name)) {
            isFriend = true;
        }
        if (person.name === companyMember.name) {
            isMember = true;
        }
    });

    return isFriend && !isMember;
}

function findNextCircle(friends, previousCircles) {
    if (previousCircles === undefined) {
        return friends
            .filter(friend => friend.best)
            .sort(compareNames);
    }

    return friends
        .filter(person => personIsFriendForCompany(person, previousCircles))
        .sort(compareNames)
        .concat(previousCircles);
}

function findCirclesOfGuests(friends, maxCircle) {
    if (maxCircle === 0) {
        return [];
    }

    var previousCircles = findNextCircle(friends);
    if (maxCircle === Infinity) {
        var nextCircles = findNextCircle(friends, previousCircles);
        while (nextCircles.length !== previousCircles.length) {
            previousCircles = nextCircles;
            nextCircles = findNextCircle(friends, previousCircles);
        }

        return previousCircles;
    }

    while (maxCircle > 1) {
        previousCircles = findNextCircle(friends, previousCircles);
        maxCircle--;
    }

    return previousCircles;
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
    this.guests = findCirclesOfGuests(friends, Infinity)
        .filter(guest => filter.condition(guest));
}

Iterator.prototype.done = function () {
    return this.guests.length === 0;
};

Iterator.prototype.next = function () {
    return (this.done()) ? null : this.guests.pop();
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

    this.guests = findCirclesOfGuests(friends, maxLevel)
        .filter(guest => filter.condition(guest));
}

LimitedIterator.prototype = Object.create(Iterator.prototype);

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

LimitedIterator.prototype.constructor = LimitedIterator;
FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
