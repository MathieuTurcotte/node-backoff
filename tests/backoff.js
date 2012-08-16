/*
 * Copyright (c) 2012 Mathieu Turcotte
 * Licensed under the MIT license.
 */

var sinon = require('sinon');

var Backoff = require('../lib/backoff'),
    BackoffStrategy = require('../lib/strategy/strategy');

exports["Backoff"] = {
    setUp: function(callback) {
        this.backoffStrategy = sinon.stub(new BackoffStrategy());
        this.backoff = new Backoff(this.backoffStrategy);
        this.clock = sinon.useFakeTimers();
        callback();
    },

    tearDown: function(callback) {
        this.clock.restore();
        callback();
    },

    "the backoff event should be emitted when backoff starts": function(test) {
        this.backoffStrategy.next.returns(10);

        var spy = new sinon.spy();
        this.backoff.on('backoff', spy);

        this.backoff.backoff();

        test.ok(spy.calledOnce);
        test.done();
    },

    "the ready event should be emitted on backoff completion": function(test) {
        this.backoffStrategy.next.returns(10);

        var spy = new sinon.spy();
        this.backoff.on('ready', spy);

        this.backoff.backoff();
        this.clock.tick(10);

        test.ok(spy.calledOnce);
        test.done();
    },

    "the backoff event should be passed the backoff delay": function(test) {
        this.backoffStrategy.next.returns(989);

        var spy = new sinon.spy();
        this.backoff.on('backoff', spy);

        this.backoff.backoff();

        test.equal(spy.getCall(0).args[1], 989);
        test.done();
    },

    "the ready event should be passed the backoff delay": function(test) {
        this.backoffStrategy.next.returns(989);

        var spy = new sinon.spy();
        this.backoff.on('ready', spy);

        this.backoff.backoff();
        this.clock.tick(989);

        test.equal(spy.getCall(0).args[1], 989);
        test.done();
    },

    "calling backoff while a backoff is in progress should throw an error": function(test) {
        this.backoffStrategy.next.returns(10);
        var backoff = this.backoff;

        backoff.backoff();

        test.throws(function() {
            backoff.backoff();
        });

        test.done();
    },

    "reset should cancel any backoff in progress": function(test) {
        this.backoffStrategy.next.returns(10);

        var spy = new sinon.spy();
        this.backoff.on('ready', spy);

        this.backoff.backoff();

        this.backoff.reset();
        this.clock.tick(100);   // 'ready' should not be emitted.

        test.equals(spy.callCount, 0);
        test.done();
    },

    "reset should reset the backoff strategy": function(test) {
        this.backoff.reset();
        test.ok(this.backoffStrategy.reset.calledOnce);
        test.done();
    },

    "the backoff number should increase from 0 to N - 1": function(test) {
        this.backoffStrategy.next.returns(10);
        var spy = new sinon.spy();
        this.backoff.on('backoff', spy);

        for (var i = 0; i < 10; i++) {
            this.backoff.backoff();
            this.clock.tick(10);
        }

        for (var j = 0; j < 10; j++) {
            test.equals(spy.getCall(j).args[0], j);
        }

        test.done();
    }
};
