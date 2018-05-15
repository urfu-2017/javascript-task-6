/* eslint-disable linebreak-style,no-shadow */
'use strict';

function compareFriends(friend1, friend2) {
    return friend1.name - friend2.name;
}

function bestList(friends) {
    let best = friends
        .filter(friends => {
            return friends.best;
        })
        .sort(compareFriends);

    return best;
}

function restFriends(friends, anotherList) {
    return friends.filter(friend => {
        return !anotherList.includes(friend);
    });
}

function getFriendsList(friends, filter, maxLevel) {
    let bestFriends = bestList(friends);
    let friendsList = [];
    let nextFriends = [];
    maxLevel = friends.length;
    while (bestFriends.length > 0 && maxLevel !== 0) {
        friendsList = friendsList.concat();
        nextFriends = bestFriends
            .reduce((res, bestFriends) => {
                return res.concat(restFriends(bestFriends.friends, res));
            },
            [])
            .map(name => {
                return friends.find(friend => {
                    return friend.name === name;
                });
            });

        bestFriends = restFriends(nextFriends, friendsList)
            .sort(compareFriends);

        maxLevel--;
    }

    return friendsList.filter(filter.filter);
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    console.info(friends, filter);
    if (!(filter instanceof Filter)) {
        throw new TypeError('Error: объект фильтра не является инстансом ' +
            'функции-конструктора Filter');
    }

    this.counter = 0;
    this.friendsList = getFriendsList(friends, filter);
}

Iterator.prototype.done = function () {
    return this.counter === this.friendsList.length;
};

Iterator.prototype.next = function () {
    return (this.done()) ? null : this.friendsList[this.counter++];
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

    this.friendsList = getFriendsList(friends, filter, maxLevel);
}
LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;


/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    console.info('Filter');
    this.filter = () => true;
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    console.info('MaleFilter');
    this.filter = friend => friend.gender === 'male';
}

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    console.info('FemaleFilter');
    this.filter = friend => friend.gender === 'female';

}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;
MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;
FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
