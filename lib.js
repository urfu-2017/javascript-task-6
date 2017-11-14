'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('Bad filter');
    }
    this.friends = friends;
    this.filter = filter;
    this.maxLevel = Number.MAX_SAFE_INTEGER;
}

Object.assign(Iterator.prototype, {
    done() {
        return this.current === this.filtredInvited.length && this.prepared;
    },
    next() {
        if (!this.prepared) {
            this.prepare();
            this.prepared = true;
        }
        if (this.current < this.filtredInvited.length) {
            return this.filtredInvited[this.current++];
        }

        return null;
    },
    filtredInvited: [],
    prepared: false,
    current: 0,

    /**
     * Подготавливает массив filtredInvited для функции next и done
     * Устанавливает флаг prepared
     */
    prepare() {
        let bestFriends = this.friends.filter(friend => friend.best);
        bestFriends.sort(alphabetOrder);
        let currentLevel = bestFriends;
        let invitedFriends = bestFriends;
        let level = 2;
        while (level <= this.maxLevel && currentLevel.length > 0) {
            let nextLevel = this.getNextLevel(currentLevel, invitedFriends)
                .sort(alphabetOrder);
            invitedFriends = invitedFriends.concat(nextLevel);
            currentLevel = nextLevel;
            level++;
        }
        this.filtredInvited = this.filter.useFilter(invitedFriends);
    },

    getNextLevel(currentLevel, invitedFriends) {
        let invitedFriendNames = invitedFriends.map(friend => friend.name);

        return currentLevel
            .reduce((nextFriendNames, currentFriend) =>
                nextFriendNames.concat(
                    currentFriend.friends
                        .filter(nextFriendName =>
                            !nextFriendNames.includes(nextFriendName) &&
                            !invitedFriendNames.includes(nextFriendName))
                ), [])
            .map(friendName => this.friends.find(friend => friend.name === friendName));
    }
});

function alphabetOrder(a, b) {
    if (a.name === b.name) {
        return 0;
    }
    if (a.name < b.name) {
        return -1;
    }

    return 1;
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
    Iterator.call(this, friends, filter);
    this.maxLevel = maxLevel;
}

Object.setPrototypeOf(LimitedIterator.prototype, Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    // Nothing
}

/**
 * @this
 */
Object.assign(Filter.prototype, {
    condition: () => true,
    useFilter(friends) {
        return friends.filter(this.condition);
    }
});

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    // Nothing
}

Object.setPrototypeOf(MaleFilter.prototype, Filter.prototype);
Object.assign(MaleFilter.prototype, {
    condition: x => x.gender === 'male'
});

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    // Nothing
}

Object.setPrototypeOf(FemaleFilter.prototype, Filter.prototype);
Object.assign(FemaleFilter.prototype, {
    condition: x => x.gender === 'female'
});

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
