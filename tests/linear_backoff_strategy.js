/*
 * Copyright (c) 2012 Mathieu Turcotte
 * Licensed under the MIT license.
 */

var sinon = require('sinon');

var LinearBackoffStrategy = require('../lib/strategy/linear');

exports["LinearBackoffStrategy"] = {

    "backoff delays should follow an linear sequence": function(test) {
        var strategy = new LinearBackoffStrategy({
            initialDelay: 10,
            maxDelay: 40
        });

        // Linear sequence: x[i] = x[0] + i * 50.
        var expectedDelays = [10, 15, 20, 25, 30, 35, 40, 40];
        var actualDelays = expectedDelays.map(function () {
            return strategy.next();
        });

        test.deepEqual(expectedDelays, actualDelays,
            'Generated delays should follow an linear sequence.');
        test.done();
    },

    "backoff delay factor should be configurable": function (test) {
        var strategy = new LinearBackoffStrategy({
            initialDelay: 10,
            maxDelay: 270,
            factor: 3
        });

        // Linear sequence: x[i] = x[0] + i * 3.
        var expectedDelays = [10, 13, 16, 19, 22];
        var actualDelays = expectedDelays.map(function () {
            return strategy.next();
        });

        test.deepEqual(expectedDelays, actualDelays,
            'Generated delays should follow a configurable linear sequence.');
        test.done();
    },

    "backoff delays should restart from the initial delay after reset": function(test) {
        var strategy = new LinearBackoffStrategy({
            initialDelay: 10,
            maxDelay: 1000
        });

        strategy.next();
        strategy.reset();

        var backoffDelay = strategy.next();
        test.equals(backoffDelay, 10,
            'Strategy should return the initial delay after reset.');
        test.done();
    }
};
