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
            this.prepare(this.friends);
            this.prepared = true;
        }
        if (this.current < this.filtredInvited.length) {
            return this.filtredInvited[this.current++];
        }

        return null;
    },
    invited: [],
    filtredInvited: [],
    prepared: false,
    current: 0,

    /**
     * Подготавливает массив filtredInvited для функции next и done
     * Устанавливает флаг prepared
     */
    prepare() {
        this.prepareNextLevel(friend => friend.best);
        let level = 2;
        while (level <= this.maxLevel) {
            let prepareResult = this.prepareNextLevel(this.friendsOfInvitedFriends);
            if (!prepareResult) {
                break;
            }
            level++;
        }
        if (level <= this.maxLevel) {
            this.prepareNextLevel(friend => !this.invited.includes(friend));
        }
        this.filtredInvited = this.filter.useFilter(this.invited);
    },

    /**
     * Принимает функцию, которая определяет следующий круг друзей
     * Функция должна возвращать true, если друг подходит для следующего круга
     * Добавляет друзей следующего круга в invited.
     * Возвращает true, если есть друзья в следующем круге
     * @param {Function} filterCallback
     * @returns {Boolean}
     */
    prepareNextLevel(filterCallback) {
        let nextLevelFriends = this.friends.filter(filterCallback, this);
        if (nextLevelFriends.length === 0) {
            return false;
        }
        nextLevelFriends.sort((a, b) => a.name > b.name);
        this.invited = this.invited.concat(nextLevelFriends);

        return true;
    },

    /**
     * функция для filter
     * Возвращает true, если друг относится к следующему кругу.
     * Следующий круг - друзья уже приглашенных друзей
     * @param {Object} friend 
     * @returns {Boolean}
     */
    friendsOfInvitedFriends(friend) {
        return !this.invited.includes(friend) && this.friends
            .filter(friendOther => this.invited.includes(friendOther))
            .some(invitedFriend => invitedFriend.friends.includes(friend.name));
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
