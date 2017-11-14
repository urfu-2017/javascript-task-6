'use strict';

function Inviter(friends) {
    this.invitedFriends = new Set(friends
        .filter(friend => friend.best)
        .sort(sorter));
    this.currentLevel = [...this.invitedFriends];
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Wrong filter type');
    }
    let previousSize = -1;
    let inviter = new Inviter(friends);
    while (previousSize !== inviter.invitedFriends.size) {
        previousSize = inviter.invitedFriends.size;
        this._fillLevel(friends, inviter);
    }
    this._resultStack = filter.filter([...inviter.invitedFriends]);
    this._pointer = 0;
}

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
function LimitedIterator(friends, filter, maxLevel) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Wrong filter type');
    }
    this._resultStack = [];
    this._pointer = 0;
    if (maxLevel <= 0) {
        return;
    }
    let inviter = new Inviter(friends);
    for (let i = 1; i < maxLevel; i++) {
        this._fillLevel(friends, inviter);
    }
    this._resultStack = filter.filter([...inviter.invitedFriends]);

}

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.filter = friends => friends;
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.filter = friends => this.mainFilter(friends, 'gender', 'male');
}

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.filter = friends => this.mainFilter(friends, 'gender', 'female');
}


Object.setPrototypeOf(MaleFilter.prototype, Filter.prototype);
Object.setPrototypeOf(FemaleFilter.prototype, Filter.prototype);
Object.setPrototypeOf(LimitedIterator.prototype, Iterator.prototype);

Object.assign(Filter.prototype, {
    mainFilter(friends, field, value) {
        return friends.filter(friend => friend[field] === value);
    }
});

Object.assign(Iterator.prototype, {
    next() {
        return this._resultStack.length > this._pointer ? this._resultStack[this._pointer++] : null;
    },
    done() {
        return this._resultStack.length <= this._pointer;
    },
    _fillLevel(friends, inviter) {
        const friendsOfFriendsNames = new Set(inviter.currentLevel.reduce(
            (acc, friend) => [...acc, ...friend.friends], []));
        inviter.currentLevel = [];
        friendsOfFriendsNames.forEach(friendName =>
            inviter.currentLevel.push(friends.find(friend => friend.name === friendName)));
        inviter.invitedFriends = new Set(
            [...inviter.invitedFriends, ...inviter.currentLevel.sort(sorter)]);
    }
});

function sorter(a, b) {
    if (a.best && b.best) {
        return a.name.localeCompare(b.name);
    }
    if (a.best) {
        return -1;
    }
    if (b.best) {
        return 1;
    }

    return a.name.localeCompare(b.name);
}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
