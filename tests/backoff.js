/*
 * Copyright (c) 2012 Mathieu Turcotte
 * Licensed under the MIT license.
 */

var events = require('events'),
    util = require('util');

var testCase = require('nodeunit').testCase,
    sinon = require('sinon');

var Backoff = require('../backoff');

exports["Backoff"] = testCase({
    setUp: function(callback) {
        this.clock = sinon.useFakeTimers();
        callback();
    },

    tearDown: function(callback) {
        this.clock.restore();
        callback();
    },

    "the 'backoff' event should be emitted on backoff completion": function(test) {
        var backoff = new Backoff({
            initialTimeout: 10,
            maxTimeout: 1000
        });
        var spy = new sinon.spy();
        backoff.on('backoff', spy);

        var expectedDelays = [10, 20, 40, 80, 160, 320, 640, 1000];
        for (var i = 0; i < expectedDelays.length; i++) {
            backoff.backoff();
            this.clock.tick(expectedDelays[i]);
            test.ok(spy.calledWith(i + 1, expectedDelays[i]));
            spy.reset();
        }

        test.done();
    },

    "the 'reset' event should be emitted on reset": function(test) {
        var backoff = new Backoff();
        var reset = sinon.spy();
        backoff.on('reset', reset);

        backoff.reset();

        test.ok(reset.calledOnce);
        test.done();
    },

    "call to backoff should be ignored when a backoff is in progress": function(test) {
        var backoff = new Backoff();
        test.ok(backoff.backoff() == true);
        test.ok(backoff.backoff() == false);
        test.done();
    },

    "it should be possible to reuse a backoff instance after reset": function(test) {
        var backoff = new Backoff({
            initialTimeout: 10,
            maxTimeout: 1000
        });
        var spy = new sinon.spy();

        // Do a first backoff, but
        // reset before completion.
        backoff.backoff();
        backoff.reset();

        // Do another backoff, listening
        // for its completion this time.
        backoff.on('backoff', spy);
        backoff.backoff();

        // Skip the initial timeout value.
        this.clock.tick(10);

        test.ok(spy.calledWith(1, 10));
        test.done();
    }
});
