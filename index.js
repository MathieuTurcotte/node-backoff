/*
 * Copyright (c) 2012 Mathieu Turcotte
 * Licensed under the MIT license.
 */

var Backoff = require('./lib/backoff'),
    FibonnaciBackoffStrategy = require('./lib/strategy/fibonnaci'),
    ExponentialBackoffStrategy = require('./lib/strategy/exponential');

module.exports.Backoff = Backoff;

/**
 * Constructs a Fibonnaci backoff.
 * @param options Fibonnaci backoff strategy arguments.
 * @see FibonnaciBackoffStrategy
 */
module.exports.fibonnaci = function(options) {
    return new Backoff(new FibonnaciBackoffStrategy(options));
};

/**
 * Constructs an exponential backoff.
 * @param options Exponential strategy arguments.
 * @see FibonnaciBackoffStrategy
 */
module.exports.exponential = function(options) {
    return new Backoff(new ExponentialBackoffStrategy(options));
};

