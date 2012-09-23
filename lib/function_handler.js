/*
 * Copyright (c) 2012 Mathieu Turcotte
 * Licensed under the MIT license.
 */

/**
 * Manages the calling of a function in a backoff loop.
 * @param fn Function to wrap.
 * @param backoff Backoff instance to use.
 * @constructor
 */
function FunctionHandler(fn, backoff) {
    this.function_ = fn; // Wrapped function.
    this.arguments_ = null; // Wrapped function's arguments.
    this.callback_ = null; // Wrapped function's callback.
    this.results_ = []; // Wrapped function's results.

    this.backoff_ = backoff;
    this.backoff_.on('ready', this.doCall_.bind(this));
    this.backoff_.on('fail', this.doCallback_.bind(this));

    this.callInProgress_ = false;
}

/**
 * Calls the wrapped function.
 * @param args Array of arguments passed to the wrapper function.
 */
FunctionHandler.prototype.call = function(args) {
    if (args.length < 1) {
        throw new Error('Should at least be called with a callback.');
    }

    // The callback function should be the last argument.
    var callbackIndex = args.length - 1;

    if (typeof args[callbackIndex] !== 'function') {
        throw new Error('Last argument should be a callback.');
    }

    if (this.callInProgress_) {
        throw new Error('Call in progress.');
    }

    this.callInProgress_ = true;

    // Save and replace the original callback function with one
    // controlled by this function handler.
    this.callback_ = args[callbackIndex];
    args[callbackIndex] = this.handleFunctionCallback_.bind(this);

    this.arguments_ = args;

    this.doCall_();
};

/**
 * Calls the wrapped function.
 * @private
 */
FunctionHandler.prototype.doCall_ = function() {
    this.function_.apply(null, this.arguments_);
};

/**
 * Calls the wrapped function's callback with the last result returned by the
 * wrapped function and an extra argument which is an array of all previous
 * results returned by the wrapped function. It's important to keep in mind
 * that depending on the wrapped function's behavior, the last argument's
 * position may change when an error is returned.
 * @private
 */
FunctionHandler.prototype.doCallback_ = function() {
    try {
        var callbackArgs = this.results_[this.results_.length - 1].concat();
        callbackArgs.push(this.results_);
        this.callback_.apply(null, callbackArgs);
    } finally {
        this.callInProgress_ = false;
        this.callback_ = null;
        this.results_ = [];
        this.backoff_.reset();
    }
};

/**
 * Handles wrapped function's completion. This method acts as a replacement
 * for the original callback function.
 * @private
 */
FunctionHandler.prototype.handleFunctionCallback_ = function() {
    var args = Array.prototype.slice.call(arguments),
        err = args[0];

    this.results_.push(args); // Save callback arguments.

    if (err) {
        this.backoff_.backoff();
    } else {
        this.doCallback_();
    }
};

module.exports = FunctionHandler;
