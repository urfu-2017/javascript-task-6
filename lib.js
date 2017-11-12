'use strict';


exports.isStar = true;


/**
 * @param {Array<name, friends, gender, best>} friends
 * @param {Filter} filter
 * @param {Number} maxLevel
 * @returns {Array<name, friends, gender, best>}
 */
function getFriendsInTraversalOrder(friends, filter, maxLevel = Infinity) {
    let nameFriendToCircleNumber = calculateCircleNumbers(friends);

    return filter.filter(friends)
        .filter(friend => friend.name in nameFriendToCircleNumber &&
                nameFriendToCircleNumber[friend.name] <= maxLevel)
        .sort((a, b) => {
            if (nameFriendToCircleNumber[a.name] <
                nameFriendToCircleNumber[b.name]) {
                return - 1;
            }
            if (nameFriendToCircleNumber[a.name] >
                nameFriendToCircleNumber[b.name]) {
                return 1;
            }

            return a.name <= b.name ? -1 : 1;
        });
}


/**
 * @param {Array<name, friends, gender, best>} friends
 * @returns {Object}
 */
function calculateCircleNumbers(friends) {
    let nameToFriend = friends.reduce((accumulator, friend) => {
        accumulator[friend.name] = friend;

        return accumulator;
    }, {});
    let queueOfFriend = friends.filter(friend => friend.best);
    let nameFriendToCircleNumber = queueOfFriend.reduce((accumulator, friend) => {
        accumulator[friend.name] = 1;

        return accumulator;
    }, {});
    for (let i = 0; i < queueOfFriend.length; i++) {
        let friend = queueOfFriend[i];
        friend.friends.forEach(nameOtherFriend => {
            if (nameOtherFriend in nameFriendToCircleNumber) {
                return;
            }
            nameFriendToCircleNumber[nameOtherFriend] = nameFriendToCircleNumber[friend.name] + 1;
            queueOfFriend.push(nameToFriend[nameOtherFriend]);
        });
    }

    return nameFriendToCircleNumber;
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    this.checkFilterType(filter);
    this.index = 0;
    this.collection = getFriendsInTraversalOrder(friends, filter);
}

Object.assign(Iterator.prototype, {
    checkFilterType(filter) {
        if (!(filter instanceof Filter)) {
            throw new TypeError('Конструктор Iterator должен принимать filter, ' +
                                'который имеет в прототипах Filter');
        }
    },
    done() {
        return this.index >= this.collection.length;
    },
    next() {
        if (this.done()) {
            return null;
        }

        return this.collection[this.index++];
    }
});

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
function LimitedIterator(friends, filter, maxLevel) {
    this.superClass(friends, filter);
    this.collection = getFriendsInTraversalOrder(friends, filter, maxLevel);
}

LimitedIterator.prototype = Object.create(Iterator.prototype,
    { 'superClass': { value: Iterator } });

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.checkCondition = () => true;
}

Object.assign(Filter.prototype, {
    filter(friends) {
        return friends.filter(this.checkCondition);
    }
});

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.checkCondition = friend => friend.gender === 'male';
}

MaleFilter.prototype = Object.create(Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.checkCondition = friend => friend.gender === 'female';
}

FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
