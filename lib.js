'use strict';

class Filter {
    constructor() {
        this.isInvitedFriend = () => true;
    }
}

class MaleFilter extends Filter {
    constructor() {
        super();
        this.isInvitedFriend = friend => {
            return friend.gender === 'male';
        };
    }
}

class FemaleFilter extends Filter {
    constructor() {
        super();
        this.isInvitedFriend = friend => {
            return friend.gender === 'female';
        };
    }
}

class Iterator {
    constructor(friends, filter) {
        if (!(filter instanceof Filter)) {
            throw new TypeError('filter should be instance of Filter');
        }
        this._index = 0;
        this._guests = getAllGuests(friends, filter);
    }
    done() {
        return this._index === this._guests.length;
    }
    next() {
        return (this.done()) ? null : this._guests[this._index++];
    }
}

class LimitedIterator extends Iterator {
    constructor(friends, filter, maxLevel) {
        super(friends, filter);
        this._guests = getAllGuests(friends, filter, maxLevel);
    }
}

function getAllGuests(friends, filter, maxFriendsCircle = Infinity) {
    let currentFriendsCircle = friends
        .filter(friend => friend.best)
        .sort(friendsSort);

    let allGuests = [];

    while (currentFriendsCircle.length > 0 && maxFriendsCircle > 0) {
        allGuests = allGuests.concat(currentFriendsCircle);

        let newGuests = getNewGuests(currentFriendsCircle, allGuests, friends);
        currentFriendsCircle = newGuests.sort(friendsSort);
        maxFriendsCircle--;
    }

    return allGuests.filter(filter.isInvitedFriend);
}

function getNewGuests(currentFriendsCircle, allGuests, friends) {
    return currentFriendsCircle
        .reduce((friendsOfFriends, currentFriend) =>
            friendsOfFriends.concat(currentFriend.friends
                .filter(friend => !friendsOfFriends.includes(friend)))
            , [])
        .map(name => friends.find(friend => friend.name === name))
        .filter(friend => !allGuests.includes(friend));
}

function friendsSort(firstFriend, secondFriend) {
    return firstFriend.name > secondFriend.name;
}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
