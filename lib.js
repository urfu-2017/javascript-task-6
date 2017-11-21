'use strict';

const levels = {
    level: undefined,
    friends: undefined,
    names: []
};

function functionCompareByName(friend, friendNext) {

    return friend.name > friendNext.name ? 1 : -1;
}

function onlyConnectedFriends(allFriends) {
    let allFriendsFriends = [];
    allFriends.forEach(function (item) {
        if (item.friends === undefined || item.friends.indexOf(undefined) !== -1) {
            throw new TypeError('friends of ungefined');
        }
        allFriendsFriends = allFriendsFriends.concat(Array.from(item.friends));
    });

    return allFriendsFriends;
}

function findBestFriends(namesAllPeople, sortFriends, allFriends, noInviteFriends) {
    const friendsOnLevel = Object.create(levels);
    friendsOnLevel.level = 0;
    friendsOnLevel.friends = allFriends.filter(function (item) {
        if (item.best) {
            friendsOnLevel.names = choiceFriend(item, friendsOnLevel.names);

            return true;
        }
        if (namesAllPeople.indexOf(item.name) !== -1) {
            noInviteFriends.push(item);
        }

        return false;

    }).sort(functionCompareByName);
    sortFriends.push(friendsOnLevel);
}

function choiceFriendsOnLevel(allFriends) {
    const sortFriends = [];
    let noInviteFriends = [];
    let namesAllPeople = onlyConnectedFriends(allFriends);
    findBestFriends(namesAllPeople, sortFriends, allFriends, noInviteFriends);
    if (sortFriends[0].friends.length === 0) {

        return [];
    }
    let argument2 = [noInviteFriends, sortFriends];
    findFriends(argument2);

    return sortFriends;
}

function findFriends(arg) {
    let noInviteFriends = arg[0];
    const sortFriends = arg[1];
    let iteration = 1;
    while (noInviteFriends.length) {
        const friendsLevel = Object.create(levels);
        friendsLevel.level = iteration;
        let choiceFriends = [];
        let argument = [noInviteFriends, sortFriends, friendsLevel];
        inspection(argument, iteration, choiceFriends);
        friendsLevel.friends = choiceFriends.sort(functionCompareByName);
        sortFriends.push(friendsLevel);
        iteration++;
    }
}

function inspection(arg, iteration, choiceFriends) {
    let noInviteFriends = arg[0];
    const sortFriends = arg[1];
    const friendsLevel = arg[2];
    let namesFriends = [];
    for (let i = 0; i < noInviteFriends.length; i++) {
        let indexNamePeople = sortFriends[iteration - 1].names.includes(noInviteFriends[i].name);
        if (indexNamePeople) {
            choiceFriends.push(noInviteFriends[i]);
            namesFriends = choiceFriend(noInviteFriends[i], namesFriends);
            noInviteFriends.splice(i, 1);
            i--;
        }
    }
    friendsLevel.names = namesFriends;
}

function choiceFriend(item, frFriendsOnLevel) {
    frFriendsOnLevel = frFriendsOnLevel.concat(item.friends.filter(function (nameFriendItem) {

        return !frFriendsOnLevel.includes(nameFriendItem);
    }));

    return frFriendsOnLevel;
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Filter не является прототипом filter');
    }
    let workWithFriends = choiceFriendsOnLevel(friends, filter);
    let maxLevel = arguments[2] >= 0 ? arguments[2] : Infinity;
    this.inviteFriends = filterFriendsByGender(workWithFriends, filter, maxLevel);
    this.indexFriend = 0;
}

function filterFriendsByGender(friends, filter, maxLevel) {
    let friendsFilter = [];
    friends.forEach(function (item) {
        if (item.level < maxLevel) {
            friendsFilter = friendsFilter.concat(item.friends.filter(function (friend) {

                return filter.field(friend);
            }));
        }
    });

    return friendsFilter;
}

Iterator.prototype.done = function () {

    return this.indexFriend === this.inviteFriends.length;
};

Iterator.prototype.next = function () {
    if (this.done()) {

        return null;
    }
    this.indexFriend++;

    return this.inviteFriends[this.indexFriend - 1];
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
    if (typeof(maxLevel) !== 'number' || maxLevel < 1) {
        maxLevel = 0;
    }
    this.super(friends, filter, maxLevel);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;
LimitedIterator.prototype.super = Iterator;

let allFilters = {
    aFilter: function () {

        return true;
    },
    aMaleFilter: function (friend) {

        return friend.gender === 'male';
    },
    aFemaleFilter: function (friend) {

        return friend.gender === 'female';
    }
};

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.field = allFilters.aFilter;
}

Filter.prototype.apply = function () {

    return this.field.apply(null, arguments);
};

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.field = allFilters.aMaleFilter;
    this.type = 'male';
}

MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.field = allFilters.aFemaleFilter;
    this.type = 'female';
}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
