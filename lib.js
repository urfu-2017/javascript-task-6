'use strict';

function sortFriendsByName(first, second) {
    if (first.name < second.name) {
        return -1;
    }
    if (first.name > second.name) {
        return 1;
    }

    return 0;
}

function getBestFriends(friends) {
    return friends.filter(friend => friend.best === true);
    // .reduce((result, current) => {
    //     result.push(current);
    //
    //     return result;
    // }, []);
}

function shouldBeVisited(friend, visited, queue) {
    return !visited.includes(friend) && queue
        .every(circle => !circle.includes(friend));
}

function getFriendsQueue(friends, filterObject) {
    const [queue, visited] = [[], []];
    let [counter, circleNumber]=[0,0];
    // const queue = [];
    // const visited = [];
    // const friendsCopy = friends.slice();
    // let counter = 0;
    // let circleNumber = 0;

    queue[circleNumber] = getBestFriends(friends);
    while (visited.length !== friends.length) {
        if (circleNumber === 0 || !queue[circleNumber - 1] || !queue[circleNumber - 1][counter]) {
            circleNumber++;
            queue[circleNumber] = [];
            counter = 0;
        }
        const curFriend = queue[circleNumber - 1][counter];
        if (!curFriend) {
            break;
        }
        visited.push(curFriend);
        // friendsCopy.splice(0, 1);
        queue[circleNumber] = queue[circleNumber]
            .concat(curFriend.friends
                .map(name => friends.find(obj => obj.name === name))
                .filter(friend => shouldBeVisited(friend, visited, queue))
                .reduce((result, current) => {
                    result.push(current);

                    return result;
                }, []));
        counter++;
    }

    return queue.map(circle => circle.filter(filterObject.filter).sort(sortFriendsByName));
    // return queue;
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Second argument is not a Filter object');
    }
    this._friendsQueue = getFriendsQueue(friends, filter);
    this._circleCounter = 0;
    console.info(this._friendsQueue);
}

Iterator.prototype.done = function () {
    return this._friendsQueue.every(circle => circle.length === 0);
};
Iterator.prototype.next = function () {
    if (this.done()) {
        return null;
    }
    const result = this._friendsQueue[this._circleCounter].shift();
    if (!this._friendsQueue[this._circleCounter].length) {
        this._circleCounter++;
    }

    return result;
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
    this._maxLevel = maxLevel;
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;
LimitedIterator.prototype.done = function () {
    return this._friendsQueue
        .every(circle => circle.length === 0) || this._circleCounter >= this._maxLevel;
};

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
    this.filter = person => person.gender === 'male';
}

MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.filter = person => person.gender === 'female';
}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
