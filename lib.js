'use strict';

function getFriends(graph, personInfo) {
    return graph.filter(function (friend) {
        return personInfo.friends.includes(friend.name);
    });
}

function makeBFSForOneLevel(res, graph, used, bfsParams) {
    let queue = bfsParams.queue.sort((friendInfo1, friendInfo2) =>
        friendInfo1.item.name.localeCompare(friendInfo2.item.name));

    while (queue.length !== 0 && queue[0].depth === bfsParams.depth) {
        let curr = queue.shift();
        res.push(curr.item);

        for (let f of getFriends(graph, curr.item).filter(friend => !used.includes(friend.name))) {
            used.push(f.name);
            queue.push({ item: f, depth: curr.depth + 1 });
        }
    }

    return queue;
}

function bfsByLevels(graph, depth) {
    let res = [];
    let queue = graph.filter(friend => friend.best)
        .map(friend => ({
            item: friend,
            depth: 0
        }));
    let used = queue.map(bfsItem => bfsItem.item.name);

    for (let currDepth = 0; currDepth < depth; currDepth++) {
        queue = makeBFSForOneLevel(res, graph, used, { queue, depth: currDepth });

        if (queue.length === 0) {
            break;
        }
    }

    return res;
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('filter in not instance of Filter');
    }

    this.index = 0;
    this.array = bfsByLevels(friends, friends.length).filter(x => filter.filter(x));
}

Iterator.prototype = {
    done() {
        return this.index >= this.array.length;
    },
    next() {
        if (this.done()) {
            return null;
        }

        return this.array[this.index++];
    }
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
    Object.setPrototypeOf(this, Iterator.prototype);

    this.array = bfsByLevels(friends, maxLevel).filter(x => filter.filter(x));
    this.index = 0;
}


/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.condition = () => true;
}

Filter.prototype = {
    filter(item) {
        return this.condition(item);
    }
};

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    Object.setPrototypeOf(this, Filter.prototype);

    this.condition = (person) => person.gender === 'male';
}


/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    Object.setPrototypeOf(this, Filter.prototype);

    this.condition = (person) => person.gender === 'female';
}


exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
