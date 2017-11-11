'use strict';


exports.isStar = true;


/**
 * @param {Array<name, friends, gender, best>} friends
 * @param {Filter} filter
 * @param {Number} maxLevel
 * @returns {Array<name, friends, gender, best>}
 */
function getEnumerator(friends, filter, maxLevel = Infinity) {
    let nameFriendToCircleNumber = calculateCircleNumbers(friends);

    return filter.filter(friends)
        .filter(friend => friend.name in nameFriendToCircleNumber &&
                nameFriendToCircleNumber[friend.name] <= maxLevel)
        .sort((thisFriend, otherFriend) => {
            if (nameFriendToCircleNumber[thisFriend.name] <
                nameFriendToCircleNumber[otherFriend.name]) {
                return - 1;
            }
            if (nameFriendToCircleNumber[thisFriend.name] >
                nameFriendToCircleNumber[otherFriend.name]) {
                return 1;
            }

            return thisFriend.name <= otherFriend.name ? -1 : 1;
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
    this.enumerator = getEnumerator(friends, filter);
    this.index = 0;
}

Object.assign(Iterator.prototype, {
    checkFilterType(filter) {
        if (!(filter instanceof Filter)) {
            throw new TypeError('Конструктор Iterator должен принимать filter, ' +
                                'который имеет в прототипах Filter');
        }
    },
    done() {
        return this.index >= this.enumerator.length;
    },
    next() {
        if (this.done()) {
            return null;
        }
        this.index++;

        return this.enumerator[this.index - 1];
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
    this.checkFilterType(filter);
    this.enumerator = getEnumerator(friends, filter, maxLevel);
    this.index = 0;
}

Object.setPrototypeOf(LimitedIterator.prototype, Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.selectionCondition = () => true;
}

Object.assign(Filter.prototype, {
    filter(friends) {
        return friends.filter(friend => this.selectionCondition(friend));
    }
});

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.selectionCondition = friend => friend.gender === 'male';
}

Object.setPrototypeOf(MaleFilter.prototype, Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.selectionCondition = friend => friend.gender === 'female';
}

Object.setPrototypeOf(FemaleFilter.prototype, Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
