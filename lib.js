'use strict';

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError();
    }
    this.friends = friends;
    this.map = {};
    for (let friend of friends) {
        this.map[friend.name] = friend;
    }
    this.current = friends.filter(f => f.best === true);
    this.index = 0;
    this.future = [];
    this.returns = [];
    this.filter = filter;
    this.best = [];
    this.other = [[]];
    this.was = false;

}

Object.assign(Iterator.prototype, {

    kek() {
        this.prepare();
        let comparator = (f1, f2) => {
            if (f1.name > f2.name) {
                return 1;
            }
            if (f1.name < f2.name) {
                return -1;
            }

            return 0;
        };
        let copy = [];
        this.best.sort(comparator);
        for (let i = 0; i < this.other.length; i++) {
            let arr = this.other[i];
            arr.sort(comparator);
            copy = copy.concat(arr);
        }
        this.other = copy;
        this.other.reverse();
        this.was = true;
    },
    done() {
        if (!this.was) {
            this.kek();
        }

        return this.best.length === 0 && this.other.length === 0;
    },
    next() {
        if (!this.was) {
            this.kek();
        }
        if (this.best.length !== 0) {
            return this.best.pop();
        }
        if (this.other.length !== 0) {
            return this.other.pop();
        }

        return null;
    },

    stop() {
        this.checkoutCurrentIfNeed();

        return this.current.length === 0;
    },

    add(friend) {
        if (friend.best) {
            this.best.push(friend);
        } else {
            this.other[this.other.length - 1].push(friend);
        }
    },
    prepare() {
        while (!this.stop()) {
            let friend = this.current[this.index];
            this.addFriendsInNext(friend);
            this.returns.push(friend);
            this.index++;
            if (this.filter.apply(friend)) {
                this.add(friend);
            }

        }
    },
    addFriendsInNext(friend) {
        for (let friendName of friend.friends) {
            let friend2 = this.map[friendName];
            if (!this.returns.includes(friend2) && !this.current.includes(friend2) &&
                !this.future.includes(friend2)) {
                this.future.push(friend2);
            }
        }
    },
    checkoutCurrentIfNeed() {
        if (this.index === this.current.length) {
            if (this.future.length === 0) {
                this.current = [];
            } else {
                this.current = this.future;
                this.future = [];
            }
            this.index = 0;
            this.other.push([]);
        }
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
    if (!(filter instanceof Filter)) {
        throw new TypeError();
    }
    this.friends = friends;
    this.map = {};
    for (let friend of friends) {
        this.map[friend.name] = friend;
    }
    this.current = friends.filter(f => f.best === true);
    this.index = 0;
    this.future = [];
    this.returns = [];
    this.filter = filter;
    this.best = [];
    this.other = [[]];
    this.was = false;
    this.maxLevel = maxLevel;
    this.level = 1;
}

Object.assign(LimitedIterator.prototype, Iterator.prototype, {
    stop() {
        this.checkoutCurrentIfNeed();

        return this.current.length === 0 || this.level > this.maxLevel;
    },

    checkoutCurrentIfNeed() {
        if (this.index === this.current.length) {
            if (this.future.length === 0) {
                this.current = [];
            } else {
                this.current = this.future;
                this.future = [];
            }
            this.index = 0;
            this.other.push([]);
            this.level++;
        }
    }
});

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.apply = function (friend) {
        return friend.hasOwnProperty('name');
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.apply = function (friend) {
        return friend.gender === 'male';
    };
}
MaleFilter.prototype = Object.create(Filter.prototype);


/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.apply = function (friend) {
        return friend.gender === 'female';
    };
}
FemaleFilter.prototype = Object.create(Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
