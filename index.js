'use strict';

let lib = require('./lib');

let friends = [
    {
        name: 'Sam',
        friends: ['Mat', 'Sharon', 'Julia'],
        gender: 'male',
        best: true
    },
    {
        name: 'Sally',
        friends: ['Brad', 'Emily'],
        gender: 'female',
        best: true
    },
    {
        name: 'Mat',
        friends: ['Sam', 'Sharon'],
        gender: 'male'
    },
    {
        name: 'Sharon',
        friends: ['Sam', 'Itan', 'Mat'],
        gender: 'female'
    },
    {
        name: 'Brad',
        friends: ['Sally', 'Emily', 'Julia'],
        gender: 'male'
    },
    {
        name: 'Emily',
        friends: ['Sally', 'Brad'],
        gender: 'female'
    },
    {
        name: 'Itan',
        friends: ['Sharon', 'Julia'],
        gender: 'male'
    },
    {
        name: 'Julia',
        friends: ['Brad', 'Itan'],
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
