'use strict';

/**
 * Фильтр друзей
 * @constructor
 */
class Filter {
    _callback() {
        return true;
    }
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
class MaleFilter extends Filter {
    _callback(friend) {
        return friend.gender === 'male';
    }
}

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
class FemaleFilter extends Filter {
    _callback(friend) {
        return friend.gender === 'female';
    }
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
class Iterator {
    constructor(friends, filter, level = Infinity) {
        this._checkFilter(filter);
        this._invitedFriends = makeFriendsList(friends, filter, level);
        this._iterator = this._invitedFriends[Symbol.iterator]();
        this._current = this._iterator.next();
    }

    _checkFilter(filter) {
        if (!(filter instanceof Filter)) {
            throw new TypeError('filter should be instance of Filter');
        }
    }

    next() {
        let prev = this._current;
        this._current = this._iterator.next();

        return prev.value;
    }

    done() {
        return this._current.done;
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
    constructor(friends, filter, level) {
        super(friends, filter, level);
    }
}


let stringCompare = (a, b) => a.name < b.name ? -1 : 1;

function makeFriendsList(friends, filter, level) {
    let currentLevelFriends = friends.filter(friend => friend.best).sort(stringCompare);
    let invitedFriends = [];

    while (level > 0 && currentLevelFriends.length !== 0) {
        invitedFriends = invitedFriends.concat(currentLevelFriends);
        let nextLevelFriends = getNextLevel(friends, invitedFriends, currentLevelFriends);
        currentLevelFriends = nextLevelFriends;
        level--;
    }

    return invitedFriends.filter(filter._callback);
}

function getNextLevel(allFriends, invitedFriends, currentLevelFriends) {
    let nextLevelFriends = [];
    currentLevelFriends.forEach(friend => {
        let nextFriends = getNextNamesFromFriend(friend, invitedFriends, allFriends);
        nextFriends = nextFriends.filter(friend_ => !nextLevelFriends.includes(friend_));
        nextLevelFriends = nextLevelFriends.concat(nextFriends);
    });

    return nextLevelFriends.sort(stringCompare);
}

function getNextNamesFromFriend(friend, invitedFriends, allFriends) {
    let friendNames = friend.friends
        .filter(friendOfFriend => !isInvited(invitedFriends, friendOfFriend));

    return getFriendsArrayByNameArray(allFriends, friendNames);
}

function isInvited(invitedFriends, friendName) {
    return invitedFriends.some(friend => friendName === friend.name);
}

function getFriendsArrayByNameArray(allFriends, nameArray) {
    return allFriends.filter(friend => nameArray.includes(friend.name));
}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
