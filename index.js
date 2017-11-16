'use strict';

let lib = require('./lib');

let friends = [
    {
        name: 'Sam',
        friendList: ['Mat', 'Sharon'],
        gender: 'male',
        best: true
    },
    {
        name: 'Sally',
        friendList: ['Brad', 'Emily'],
        gender: 'female',
        best: true
    },
    {
        name: 'Mat',
        friendList: ['Sam', 'Sharon'],
        gender: 'male'
    },
    {
        name: 'Sharon',
        friendList: ['Sam', 'Itan', 'Mat'],
        gender: 'female'
    },
    {
        name: 'Brad',
        friendList: ['Sally', 'Emily', 'Julia'],
        gender: 'male'
    },
    {
        name: 'Emily',
        friendList: ['Sally', 'Brad'],
        gender: 'female'
    },
    {
        name: 'Itan',
        friendList: ['Sharon', 'Julia'],
        gender: 'male'
    },
    {
        name: 'Julia',
        friendList: ['Brad', 'Itan'],
        gender: 'female'
    }
];

// Создаем фильтры парней и девушек
let maleFilter = new lib.MaleFilter();
let femaleFilter = new lib.FemaleFilter();

// Создаем итераторы
let femaleIterator = new lib.Iterator(friends, femaleFilter);

// Среди парней приглашаем только луших друзей и друзей лучших друзей
let maleIterator = new lib.LimitedIterator(friends, maleFilter, 2);

let invitedFriends = [];

// Собираем пары «парень + девушка»
while (!maleIterator.done() && !femaleIterator.done()) {
    invitedFriends.push([
        maleIterator.next(),
        femaleIterator.next()
    ]);
}

// Если остались девушки, то приглашаем остальных
while (!femaleIterator.done()) {
    invitedFriends.push(femaleIterator.next());
}

console.info(invitedFriends);
// Sam, Sally
// Brad, Emily
// Mat, Sharon
// Julia
