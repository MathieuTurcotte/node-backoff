/*
 * Copyright (c) 2012 Mathieu Turcotte
 * Licensed under the MIT license.
 */

var sinon = require('sinon');

var FibonacciBackoffStrategy = require('../lib/strategy/fibonacci');

exports["FibonacciBackoffStrategy"] = {
    setUp: function(callback) {
        this.strategy = new FibonacciBackoffStrategy({
            initialDelay: 10,
            maxDelay: 1000
        });
        callback();
    },

    "backoff delays should follow a Fibonacci sequence": function(test) {
        // Fibonacci sequence: x[i] = x[i-1] + x[i-2].
        var delays = [10, 10, 20, 30, 50, 80, 130, 210, 340, 550, 890, 1000];

        delays.forEach(function(delay) {
            var backoff = this.strategy.next();
            test.equals(backoff, delay);
        }, this);

        test.done();
    },

    "backoff delays should restart from the initial delay after reset": function(test) {
        var strategy = new FibonacciBackoffStrategy({
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
