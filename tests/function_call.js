/*
 * Copyright (c) 2012 Mathieu Turcotte
 * Licensed under the MIT license.
 */

var events = require('events'),
    sinon = require('sinon'),
    util = require('util');

var FunctionCall = require('../lib/function_call');

function MockBackoff() {
    events.EventEmitter.call(this);

    this.reset = sinon.spy();
    this.backoff = sinon.spy();
    this.failAfter = sinon.spy();
}
util.inherits(MockBackoff, events.EventEmitter);

exports["FunctionCall"] = {
    setUp: function(callback) {
        this.wrappedFn = sinon.stub();
        this.callback = sinon.stub();
        this.backoff = new MockBackoff();
        this.backoffFactory = sinon.stub();
        this.backoffFactory.returns(this.backoff);
        callback();
    },

    tearDown: function(callback) {
        callback();
    },

    "constructor's first argument should be a function": function(test) {
        test.throws(function() {
            new FunctionCall(1, [], function() {});
        }, /should be a function/);
        test.done();
    },

    "constructor's last argument should be a function": function(test) {
        test.throws(function() {
            new FunctionCall(function() {}, [], 3);
        }, /should be a function/);
        test.done();
    },

    "setStrategy should overwrite the default strategy": function(test) {
        var replacementStrategy = {};
        var call = new FunctionCall(this.wrappedFn, [], this.callback);
        call.setStrategy(replacementStrategy);
        call.call(this.backoffFactory);
        test.ok(this.backoffFactory.calledWith(replacementStrategy),
                'User defined strategy should be used to instantiate ' +
                'the backoff instance.');
        test.done();
    },

    "setStrategy should throw if the call is in progress": function(test) {
        var call = new FunctionCall(this.wrappedFn, [], this.callback);
        call.call(this.backoffFactory);
        test.throws(function() {
            call.setStrategy({});
        }, /in progress/);
        test.done();
    },

    "failAfter should overwrite the maximum number of backoffs": function(test) {
        var failAfterValue = 99;
        var call = new FunctionCall(this.wrappedFn, [], this.callback);
        call.failAfter(failAfterValue);
        call.call(this.backoffFactory);
        test.ok(this.backoff.failAfter.calledWith(failAfterValue),
                'User defined maximum number of backoffs shoud be ' +
                'used to configure the backoff instance.');
        test.done();
    },

    "failAfter should throw if the call is in progress": function(test) {
        var call = new FunctionCall(this.wrappedFn, [], this.callback);
        call.call(this.backoffFactory);
        test.throws(function() {
            call.failAfter(1234);
        }, /in progress/);
        test.done();
    },

    "call shouldn't allow overlapping invocation": function(test) {
        var call = new FunctionCall(this.wrappedFn, [], this.callback);
        var backoffFactory = this.backoffFactory;

        call.call(backoffFactory);
        test.throws(function() {
            call.call(backoffFactory);
        }, /in progress/);
        test.done();
    },

    "call should forward its arguments to the wrapped function": function(test) {
        var call = new FunctionCall(this.wrappedFn, [1, 2, 3], this.callback);
        call.call(this.backoffFactory);
        test.ok(this.wrappedFn.calledWith(1, 2, 3));
        test.done();
    },

    "call should complete when the wrapped function succeed": function(test) {
        var call = new FunctionCall(this.wrappedFn, [1, 2, 3], this.callback);
        this.wrappedFn.yields(new Error());
        call.call(this.backoffFactory);

        for (var i = 0; i < 3; i++) {
            this.backoff.emit('ready');
        }

        test.equals(this.callback.callCount, 0);

        this.wrappedFn.yields(null, 'Success!');
        this.backoff.emit('ready');

        test.ok(this.callback.calledWith(null, 'Success!'));
        test.done();
    },

    "call should fail when the backoff limit is reached": function(test) {
        var call = new FunctionCall(this.wrappedFn, [1, 2, 3], this.callback);
        var error = new Error();
        this.wrappedFn.yields(error);
        call.call(this.backoffFactory);

        for (var i = 0; i < 3; i++) {
            this.backoff.emit('ready');
        }

        test.equals(this.callback.callCount, 0);

        this.backoff.emit('fail');

        test.ok(this.callback.calledWith(error));
        test.done();
    },

    "wrapped function shouldn't be called after abort": function(test) {
        var call = new FunctionCall(this.wrappedFn, [], this.callback);
        call.abort();
        call.call(this.backoffFactory);
        test.equals(this.wrappedFn.callCount, 0, 'Wrapped function ' +
                    'shouldn\'t be called after abort.');
        test.done();
    },

    "wrapped function's callback shouldn't be called after abort": function(test) {
        var call = new FunctionCall(function(callback) {
            call.abort(); // Abort in middle of wrapped function's execution.
            callback(null, 'ok');
        }, [], this.callback);

        call.call(this.backoffFactory);

        test.equals(this.callback.callCount, 0, 'Wrapped function\'s ' +
                    'callback shouldn\'t be called after abort.');
        test.done();
    },

    "getResults should return intermediary results": function(test) {
        var call = new FunctionCall(this.wrappedFn, [], this.callback);
        this.wrappedFn.yields(1);
        call.call(this.backoffFactory);

        for (var i = 2; i < 5; i++) {
            this.wrappedFn.yields(i);
            this.backoff.emit('ready');
        }

        this.wrappedFn.yields(null);
        this.backoff.emit('ready');

        test.deepEqual([[1], [2], [3], [4], [null]], call.getResults());
        test.done();
    },

    "wrapped function's errors should be propagated": function(test) {
        var call = new FunctionCall(this.wrappedFn, [1, 2, 3], this.callback);
        this.wrappedFn.throws(new Error());
        test.throws(function() {
            call.call(this.backoffFactory);
        }, Error);
        test.done();
    },

    "wrapped callback's errors should be propagated": function(test) {
        var call = new FunctionCall(this.wrappedFn, [1, 2, 3], this.callback);
        this.wrappedFn.yields(null, 'Success!');
        this.callback.throws(new Error());
        test.throws(function() {
            call.call(this.backoffFactory);
        }, Error);
        test.done();
    }
};
