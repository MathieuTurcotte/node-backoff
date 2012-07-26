/*
 * Copyright (c) 2012 Mathieu Turcotte
 * Licensed under the MIT license.
 */

var sinon = require('sinon');

var FibonnaciBackoffStrategy = require('../lib/strategy/fibonnaci');

exports["FibonnaciBackoffStrategy"] = {
    setUp: function(callback) {
        this.strategy = new FibonnaciBackoffStrategy({
            initialDelay: 10,
            maxDelay: 1000
        });
        callback();
    },

    "backoff delays should follow a Fibonnaci sequence": function(test) {
        // Fibonnaci sequence: x[i] = x[i-1] + x[i-2].
        var delays = [10, 10, 20, 30, 50, 80, 130, 210, 340, 550, 890, 1000];

        delays.forEach(function(delay) {
            var backoff = this.strategy.next();
            test.equals(backoff, delay);
        }, this);

        test.done();
    },

    "backoff delays should restart from the initial delay after reset": function(test) {
        var strategy = new FibonnaciBackoffStrategy({
            initialDelay: 10,
            maxDelay: 1000
        });

        strategy.next();
        strategy.reset();

        var backoffDelay = strategy.next();
        test.equals(backoffDelay, 10);
        test.done();
    }
};
