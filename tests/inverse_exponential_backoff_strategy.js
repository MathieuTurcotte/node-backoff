/*
 * 
 * Licensed under the MIT license.
 */

var sinon = require('sinon');

var InverseExponentialBackoffStrategy = require('../lib/strategy/inverse_exponential');

exports["InverseExponentialBackoffStrategy"] = {

    "backoff delays should follow an inverse exponential sequence": function(test) {
        var strategy = new InverseExponentialBackoffStrategy({
            initialDelay: 512
        });

        // sequence: x[i] = x[i-1] / 2.
        var expectedDelays = [512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0];
        var actualDelays = expectedDelays.map(function () {
            return strategy.next();
        });

        test.deepEqual(expectedDelays, actualDelays,
            'Generated delays should follow an exponential sequence.');
        test.done();
    },

    "backoff delay factor should be configurable": function (test) {
        var strategy = new InverseExponentialBackoffStrategy({
            initialDelay: 1024,
            factor: 4
        });

        // Exponential sequence: x[i] = x[i-1] / 4.
        var expectedDelays = [1024, 256, 64, 16, 4, 1, 0];
        var actualDelays = expectedDelays.map(function () {
            return strategy.next();
        });

        test.deepEqual(expectedDelays, actualDelays,
            'Generated delays should follow a configurable exponential sequence.');
        test.done();
    },

    "backoff delays should restart from the initial delay after reset": function(test) {
        var strategy = new InverseExponentialBackoffStrategy({
            initialDelay: 512
        });

        strategy.next();
        strategy.reset();

        var backoffDelay = strategy.next();
        test.equals(backoffDelay, 512,
            'Strategy should return the initial delay after reset.');
        test.done();
    }
};
