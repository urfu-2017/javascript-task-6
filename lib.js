'use strict';

function compareNames(a, b) {
    return a.name > b.name ? 1 : -1;
}

function makeFriendsByName(friends) {
    return friends.reduce((object, currentFriend) => {
        object[currentFriend.name] = currentFriend;

        return object;
    }, {});
}

function fillingLevel(invited, person, objectForFriends, nextLevel) {
    invited.push(person);
    delete objectForFriends[person.name];
    person.friends.forEach(friend => {
        if (friend in objectForFriends) {
            nextLevel.push(objectForFriends[friend]);
        }
    });
}

function fillingLevels(invited, nextLevel, maxLevel, objectForFriends) {
    let currentLevel = nextLevel;
    nextLevel = [];
    let fillingFriends = person => {
        if (person.name in objectForFriends) {
            fillingLevel(invited, person, objectForFriends, nextLevel);
        }
    };
    while (currentLevel.length !== 0 && maxLevel !== 0) {
        currentLevel.sort(compareNames);
        currentLevel.forEach(fillingFriends);
        currentLevel = nextLevel;
        nextLevel = [];
        maxLevel--;
    }

    return invited;
}

function distributeByLevels(friends, filter, maxLevel) {
    if (!friends || !maxLevel || maxLevel < 1) {
        return [];
    }
    let nextLevel = [];
    let invited = [];
    let objectForFriends = makeFriendsByName(friends);
    friends.sort(compareNames).forEach(person => {
        if (person.best) {
            fillingLevel(invited, person, objectForFriends, nextLevel);
        }
    });
    maxLevel--;
    invited = filter.getPeopleWithSameGender(
        fillingLevels(invited, nextLevel, maxLevel, objectForFriends));

    return invited;
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('filter не является объектом конструктора Filter');
    }
    this.friends = distributeByLevels(friends, filter, Infinity);
    this.indexCurrentFriend = 0;
}

Iterator.prototype.done = function () {
    return this.indexCurrentFriend === this.friends.length;
};
Iterator.prototype.next = function () {
    if (this.done()) {
        return null;
    }

    return this.friends[this.indexCurrentFriend++];
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
    this.friends = distributeByLevels(friends, filter, maxLevel);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.gender = 'nothing';
}

Filter.prototype.getPeopleWithSameGender = function (people) {
    return people.filter(function (person) {
        return person.gender === this.gender || this.gender === 'nothing';
    }, this);
};

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.gender = 'male';
}

MaleFilter.prototype = Object.create(Filter.prototype);


/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.gender = 'female';
}

FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
