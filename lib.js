'use strict';

/**
 * @description Фильтр друзей
 */
class Filter {
    filterPerson() {
        return true;
    }
}

/**
 * @description Фильтр друзей-парней
 */
class MaleFilter extends Filter {
    filterPerson(person) {
        return person.gender === 'male';
    }
}

/**
 * @description Фильтр друзей-девушек
 */
class FemaleFilter extends Filter {
    filterPerson(person) {
        return person.gender === 'female';
    }
}

const sortByName = (a, b) => {
    if (a.name === b.name) {
        return 0;
    }

    return a.name > b.name ? 1 : -1;
};

const getFriendsOf = (friend, friends) => {
    return friend.friends
        .map(friendName => friends.find(f => f.name === friendName));
};

/**
 * @description Итератор по друзьям
 */
class Iterator {

    /**
     * @param {Object[]} friends
     * @param {Filter} filter
     */
    constructor(friends, filter) {
        if (!(filter instanceof Filter)) {
            throw new TypeError('filter should be instance of Filter');
        }

        this._friends = friends;
        this._filter = filter;
        this._currentFriendCount = 0;
        this._maxLevel = Infinity;
    }

    done() {
        if (!this._invitedFriends) {
            this._invitedFriends = this._getInvitees(this._friends, this._filter);
        }

        return this._currentFriendCount === this._invitedFriends.length;
    }

    next() {
        return this.done() ? null : this._invitedFriends[this._currentFriendCount++];
    }

    _getInvitees(friends, filter) {
        const friendsDict = friends.reduce(function (result, friend) {
            result[friend.name] = getFriendsOf(friend, friends);

            return result;
        }, Object.create(null));


        let friendsToVisit = friends.filter(friend => friend.best);
        const visitedFriends = [];
        const isNotVisited = friend => !visitedFriends.includes(friend);

        while (this._maxLevel-- > 0 && friendsToVisit.length !== 0) {
            friendsToVisit.sort(sortByName);
            visitedFriends.push(...friendsToVisit);
            friendsToVisit = friendsToVisit.reduce((result, currentFriend) => {
                const notVisited = friendsDict[currentFriend.name]
                    .filter(friend => isNotVisited(friend) && !result.includes(friend));

                return result.concat(notVisited);
            }, []);
        }

        return visitedFriends.filter(filter.filterPerson);
    }
}

/**
 * @description Итератор по друзям с ограничением по кругу
 */
class LimitedIterator extends Iterator {

    /**
     * @param {Object[]} friends
     * @param {Filter} filter
     * @param {Number} maxLevel – максимальный круг друзей
     */
    constructor(friends, filter, maxLevel) {
        super(friends, filter);
        this._maxLevel = maxLevel;
    }
}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
