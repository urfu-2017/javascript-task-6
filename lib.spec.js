/* eslint-env mocha */
'use strict';

var assert = require('assert');

var lib = require('./lib');

var friends = [
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

describe('Итераторы', function () {
    it('должны обойти в правильном порядке друзей и составить пары', function () {
        var maleFilter = new lib.MaleFilter();
        var femaleFilter = new lib.FemaleFilter();
        var maleIterator = new lib.LimitedIterator(friends, maleFilter, 2);
        var femaleIterator = new lib.Iterator(friends, femaleFilter);

        var invitedFriends = [];
        while (!maleIterator.done() && !femaleIterator.done()) {
            invitedFriends.push([
                maleIterator.next(),
                femaleIterator.next()
            ]);
        }
        while (!femaleIterator.done()) {
            invitedFriends.push(femaleIterator.next());
        }

        assert.deepStrictEqual(invitedFriends, [
            [friend('Sam'), friend('Sally')],
            [friend('Brad'), friend('Emily')],
            [friend('Mat'), friend('Sharon')],
            friend('Julia')
        ]);
    });

    function friend(name) {
        var len = friends.length;
        while (len--) {
            if (friends[len].name === name) {
                return friends[len];
            }
        }
    }
});
