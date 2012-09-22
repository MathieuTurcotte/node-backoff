/*
 * Copyright (c) 2012 Mathieu Turcotte
 * Licensed under the MIT license.
 */

var Backoff = require('./lib/backoff'),
    FunctionHandler = require('./lib/function_handler.js'),
    FibonacciBackoffStrategy = require('./lib/strategy/fibonacci'),
    ExponentialBackoffStrategy = require('./lib/strategy/exponential');

module.exports.Backoff = Backoff;
module.exports.FunctionHandler = FunctionHandler;
module.exports.FibonacciStrategy = FibonacciBackoffStrategy;
module.exports.ExponentialStrategy = ExponentialBackoffStrategy;

/**
 * Constructs a Fibonacci backoff.
 * @param options Fibonacci backoff strategy arguments.
 * @return The fibonacci backoff.
 * @see FibonacciBackoffStrategy
 */
module.exports.fibonacci = function(options) {
    return new Backoff(new FibonacciBackoffStrategy(options));
};

/**
 * Constructs an exponential backoff.
 * @param options Exponential strategy arguments.
 * @return The exponential backoff.
 * @see ExponentialBackoffStrategy
 */
module.exports.exponential = function(options) {
    return new Backoff(new ExponentialBackoffStrategy(options));
};

/**
 * Wraps a function in a backoff handler.
 * @param fn Function to wrap in a backoff handler.
 * @param options Optional backoff strategy's options.
 * @param BackoffStrategy Optional backoff strategy's constructor, defaults
 *    to a fibonacci strategy.
 * @param failAfter Optional fail after parameter to the backoff, defaults
 *    to 5.
 * @return The wrapped function.
 */
module.exports.wrap = function(fn, options, BackoffStrategy, failAfter) {
    if (typeof options !== 'object') {
        BackoffStrategy = options;
        options = undefined;
    }

    if (typeof BackoffStrategy === 'number') {
        failAfter = BackoffStrategy;
        BackoffStrategy = undefined;
    }

    // Overwrite with defaults.
    BackoffStrategy = BackoffStrategy || FibonacciBackoffStrategy;
    failAfter = failAfter || 5;

    // Perform up front validation to localize errors on the wrapping site
    // instead of the calling site as much as possible.
    if (failAfter < 1) {
        throw new Error('Fail after must be greater than 0. ' +
                        'Actual: ' + failAfter);
    }

    if (typeof BackoffStrategy !== 'function') {
        throw new Error('The backoff strategy should be a function. ' +
                        'Actual: ' + typeof BackoffStrategy);
    }

    // Defer handler's creation until the first call to the wrapped function
    // is made to make sure that calls don't share state between them.
    return function() {
        var backoff = new Backoff(new BackoffStrategy(options));
        backoff.failAfter(failAfter);
        var handler = new FunctionHandler(fn, backoff);
        handler.call(Array.prototype.slice.call(arguments));
    };
};

