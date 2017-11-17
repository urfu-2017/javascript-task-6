'use strict';

/**
 * Фильтр друзей
 * @constructor
 */
class Filter {
    callback() {
        return true;
    }
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
class MaleFilter extends Filter {
    callback(friend) {
        return friend.gender === 'male';
    }
}

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
class FemaleFilter extends Filter {
    callback(friend) {
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
    constructor(friends, filter) {
        this._checkFilter(filter);
        this._level = Infinity;
        this._friends = friends;
        this._filter = filter;
        this._isInvitedFriendsInitialized = false;
    }

    _initializeInvitedFriends() {
        this._invitedFriends = makeInvitedFriendsList(this._friends, this._filter, this._level);
        this._iterator = this._invitedFriends[Symbol.iterator]();
        this._current = this._iterator.next();
        this._isInvitedFriendsInitialized = true;
    }

    _checkFilter(filter) {
        if (!(filter instanceof Filter)) {
            throw new TypeError('filter should be instance of Filter');
        }
    }

    next() {
        if (!this._isInvitedFriendsInitialized) {
            this._initializeInvitedFriends();
        }

        let prev = this._current;
        this._current = this._iterator.next();

        return prev.value === undefined ? null : prev.value;
    }

    done() {
        if (!this._isInvitedFriendsInitialized) {
            this._initializeInvitedFriends();
        }

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
        super(friends, filter);
        this._level = level;
    }
}


let nameCompare = (a, b) => a.name < b.name ? -1 : 1;

function makeInvitedFriendsList(friends, filter, level) {
    let currentLevelFriends = friends.filter(friend => friend.best).sort(nameCompare);
    let invitedFriends = [];

    while (level > 0 && currentLevelFriends.length !== 0) {
        invitedFriends = invitedFriends.concat(currentLevelFriends);
        currentLevelFriends = getNextLevel(friends, invitedFriends, currentLevelFriends);
        level--;
    }

    return invitedFriends.filter(filter.callback);
}

function getNextLevel(allFriends, invitedFriends, currentLevelFriends) {
    let nextLevelFriends = [];
    currentLevelFriends.forEach(friend => {
        let nextFriends = getNextFromFriend(friend, invitedFriends, allFriends);
        nextFriends = nextFriends.filter(nextFriend => !nextLevelFriends.includes(nextFriend));
        nextLevelFriends = nextLevelFriends.concat(nextFriends);
    });

    return nextLevelFriends.sort(nameCompare);
}

function getNextFromFriend(friend, invitedFriends, allFriends) {
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
