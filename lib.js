'use strict';

/**
 * Фильтр друзей
 * @constructor
 */
class Filter {
    constructor() {
        this.gender = function () {
            return true;
        };
    }
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
class MaleFilter extends Filter {
    constructor() {
        super();
        this.gender = function (friend) {
            return friend.gender === 'male';
        };
    }
}

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
class FemaleFilter extends Filter {
    constructor() {
        super();
        this.gender = function (friend) {
            return friend.gender === 'female';
        };
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
        if (!(filter instanceof Filter)) {
            throw new TypeError('type of param "filter" is not Filter');
        }

        var values = { 'circle': 1, 'current': 0, 'end': 0,
            '_subfriends': [], 'friendOfFriends': [], 'checkedFriends': [],
            '_true': true, 'results': 0, 'count': 0 };

        Object.keys(values).forEach(function (element) {
            this[element] = values[element];
        }, this);
        this.friends = friends;
        this.friends.sort(function (first, second) {
            if (first.name > second.name) {
                return 1;
            } else if (first.name < second.name) {
                return -1;
            }

            return 0;
        });

        this.calculateCount = function () {
            for (var friend of this.friends) {
                if (filter.gender(friend)) {
                    this.count += 1;
                }
            }

            if (this.friends.filter((_friend) => _friend.best).length === 0) {
                this.end = 1;
            }
        };

        this.calculateCount();

        this.changeValues = function () {
            this.results += 1;
            this.end = this.results === this.count ? 1 : 0;
            this.current += 1;
        };

        this.foundFriend = function () {
            if (this.circle === 1 && this.friends[this.current].best) {
                this.checkedFriends.push(this.friends[this.current].name);
                this._subfriends = this._subfriends.concat(this.friends[this.current].friends);
                if (filter.gender(this.friends[this.current])) {
                    this.changeValues();

                    return friends[this.current - 1];
                }
            } else if (this.friendOfFriends.indexOf(this.friends[this.current].name) !== -1 &&
                this.checkedFriends.indexOf(this.friends[this.current].name) === -1) {
                this.checkedFriends.push(this.friends[this.current].name);
                this._subfriends = this._subfriends.concat(this.friends[this.current].friends);
                if (filter.gender(this.friends[this.current])) {
                    this.changeValues();

                    return this.friends[this.current - 1];
                }
            }
        };

        this.foundNext = function () {
            for (this.current; this.current < this.friends.length; this.current++) {
                let result = this.foundFriend();
                if (result !== undefined) {
                    return result;
                }
            }
        };

        this.next = function () {
            while (this._true) {
                if (this.end) {
                    return null;
                }
                let result = this.foundNext();
                if (result !== undefined) {
                    return result;
                }
                this.circle += 1;
                this.current = 0;
                this.friendOfFriends = this._subfriends;
                this._subfriends = [];
                this.checkFinish();
            }
        };

        this.done = function () {
            if (this.end === 1) {
                return true;
            }

            return false;
        };

        this.checkFinish = function () {
            if (this.friendOfFriends.length === 0) {
                this.end = 1;
            }
        };

        this.getFriend = function (_name) {
            var i = this.friends.length;
            while (i--) {
                if (this.friends[i].name === _name) {
                    return this.friends[i];
                }
            }
        };
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
    constructor(friends, filter, maxLevel) {
        super(friends, filter);
        if (this.maxLevel <= 0) {
            this.end = 1;
        }
        this.checkFinish = function () {
            if (this.friendOfFriends.length === 0 ||
                this.circle > maxLevel) {
                this.end = 1;
            }
        };

        this.calcDeep = function (deep, checked, value) {
            let names = Object.keys(deep).filter((nameFriend) => {
                return deep[nameFriend] === value - 1;
            });
            for (let name of names) {
                let array = this.getFriend(name).friends.filter((nameFriend) => {
                    return checked.indexOf(nameFriend) === -1;
                });
                array.forEach(function (element) {
                    checked.push(element);
                    deep[element] = value;
                });
            }
        };

        this.calculateDeep = function (deep) {
            let checked = [];
            let value = 1;
            for (var friend of this.friends) {
                if (friend.best) {
                    deep[friend.name] = value;
                    checked.push(friend.name);
                }
            }
            while (this._true) {
                value += 1;
                this.calcDeep(deep, checked, value);
                if (Object.values(deep).indexOf(value) === -1) {
                    break;
                }
            }

            return deep;
        };

        this.deep = {};
        this.calculateDeep(this.deep);

        this.calculateCount = function () {
            let count = 0;
            for (var _friend of this.friends) {
                if (filter.gender(_friend) && this.deep[_friend.name] <= maxLevel) {
                    count += 1;
                }
            }

            return count;
        };

        this.count = this.calculateCount();
    }
}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
