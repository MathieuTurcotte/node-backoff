/*
 * Copyright (c) 2012 Mathieu Turcotte
 * Licensed under the MIT license.
 */

var sinon = require('sinon');

var Backoff = require('../backoff');

exports["Backoff"] = {
    setUp: function(callback) {
        this.clock = sinon.useFakeTimers();
        callback();
    },

    tearDown: function(callback) {
        this.clock.restore();
        callback();
    },

    "'backoff' event should be emitted on backoff completion": function(test) {
        var backoff = new Backoff({
            initialTimeout: 10
        });
        var spy = new sinon.spy();
        backoff.on('backoff', spy);

        backoff.backoff();
        this.clock.tick(10);

        test.ok(spy.calledOnce, 'backoff event has not been emitted');
        test.done();
    },

    "'reset' event should be emitted on reset": function(test) {
        var backoff = new Backoff();
        var reset = sinon.spy();
        backoff.on('reset', reset);

        backoff.reset();

        test.ok(reset.calledOnce, 'reset event has not been emitted');
        test.done();
    },

    "the backoff delay should increase exponentially from initialTimeout to maxTimeout": function(test) {
        var backoff = new Backoff({
            initialTimeout: 10,
            maxTimeout: 1000
        });
        var spy = new sinon.spy();
        backoff.on('backoff', spy);

        var clock = this.clock;
        var delays = [10, 20, 40, 80, 160, 320, 640, 1000, 1000];

        delays.forEach(function(delay, i) {
            backoff.backoff();
            clock.tick(delay);
        });

        delays.forEach(function(delay, i) {
            test.equals(spy.getCall(i).args[0], i + 1);
            test.equals(spy.getCall(i).args[1], delay);
        });

        test.done();
    },

    "the initial timeout should be greater than 0": function(test) {
        test.throws(function() {
            var backoff = new Backoff({
                initialTimeout: -1
            });
        });

        test.throws(function() {
            var backoff = new Backoff({
                initialTimeout: 0
            });
        });

        test.doesNotThrow(function() {
            var backoff = new Backoff({
                initialTimeout: 1
            });
        });

        test.done();
    },

    "the maximal timeout should be greater than 0": function(test) {
        test.throws(function() {
            var backoff = new Backoff({
                maxTimeout: -1
            });
        });

        test.throws(function() {
            var backoff = new Backoff({
                maxTimeout: 0
            });
        });

        test.done();
    },

    "the maximal timeout should be greater than the original timeout": function(test) {
        test.throws(function() {
            var backoff = new Backoff({
                initialTimeout: 10,
                maxTimeout: 10
            });
        });

        test.doesNotThrow(function() {
            var backoff = new Backoff({
                initialTimeout: 10,
                maxTimeout: 11
            });
        });

        test.done();
    },

    "call to backoff while a backoff is in progress should throw an error": function(test) {
        var backoff = new Backoff();
        backoff.backoff();

        test.throws(function() {
            backoff.backoff();
        });

        test.done();
    },

    "calling reset when a backoff is in progress should disarm the timeout": function(test) {
        var backoff = new Backoff({
            initialTimeout: 10
        });

        var spy = new sinon.spy();
        backoff.on('backoff', spy);

        backoff.backoff();

        backoff.reset();
        this.clock.tick(100);   // 'backoff' should not be emitted.

        test.equals(spy.callCount, 0, "backoff timeout did trigger");
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
};
