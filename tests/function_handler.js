/*
 * Copyright (c) 2012 Mathieu Turcotte
 * Licensed under the MIT license.
 */

var events = require('events'),
    sinon = require('sinon'),
    util = require('util');

var FunctionHandler = require('../lib/function_handler');

function MockBackoff() {
    events.EventEmitter.call(this);

    this.reset = sinon.spy();
    this.backoff = sinon.spy();
    this.failAfter = sinon.spy();
}
util.inherits(MockBackoff, events.EventEmitter);

exports["FunctionHandler"] = {
    setUp: function(callback) {
        this.wrapped = sinon.stub();
        this.callback = sinon.stub();
        this.backoff = new MockBackoff();
        this.handler = new FunctionHandler(this.wrapped, this.backoff);
        callback();
    },

    tearDown: function(callback) {
        callback();
    },

    "call's last argument should be a function": function(test) {
        var handler = this.handler;

        // With no argument.
        test.throws(function() {
            handler.call([]);
        });

        // With one argument.
        test.throws(function() {
            handler.call([1]);
        });

        test.done();
    },

    "call shouldn't allow overlapping invocation": function(test) {
        var handler = this.handler;

        handler.call([function() {}]);

        // Overlapping call should throw.
        test.throws(function() {
            handler.call([function() {}]);
        });

        test.done();
    },

    "call should forward its arguments to the wrapped function": function(test) {
        this.handler.call([1, 2, 3, function() {}]);
        test.ok(this.wrapped.calledWith(1, 2, 3));
        test.done();
    },

    "call should complete when the wrapped function succeed": function(test) {
        this.wrapped.yields(new Error());
        this.handler.call([this.callback]);

        for (var i = 0; i < 3; i++) {
            this.backoff.emit('ready');
        }

        test.equals(this.callback.callCount, 0);

        this.wrapped.yields(null, 'Success!');
        this.backoff.emit('ready');

        test.ok(this.callback.calledWith(null, 'Success!'));
        test.done();
    },

    "call should fail when the backoff limit is reached": function(test) {
        var error = new Error();
        this.wrapped.yields(error);
        this.handler.call([this.callback]);

        for (var i = 0; i < 3; i++) {
            this.backoff.emit('ready');
        }

        test.equals(this.callback.callCount, 0);

        this.backoff.emit('fail');

        test.ok(this.callback.calledWith(error));
        test.done();
    },

    "call should fail immediately if an error is thrown by the wrapped function": function(test) {
        var error = new Error();
        this.wrapped.throws(error);
        this.handler.call([this.callback]);
        test.ok(this.callback.calledWith(error));
        test.done();
    },

    "wrapped callback should be passed the results history as its last argument": function(test) {
        this.wrapped.yields(1);
        this.handler.call([this.callback]);

        for (var i = 2; i < 5; i++) {
            this.wrapped.yields(i);
            this.backoff.emit('ready');
        }

        this.wrapped.yields(null);
        this.backoff.emit('ready');

        test.ok(this.callback.calledWith(null, [[1], [2], [3], [4], [null]]));
        test.done();
    },

    "wrapped callback's errors should be propagated": function(test) {
        this.wrapped.yields(null, 'Success!');
        this.callback.throws(new Error());
        var handler = this.handler;
        test.throws(function() {
            handler.call([this.callback]);
        });
        test.done();
    }
};
