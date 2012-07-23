/*
 * Copyright (c) 2012 Mathieu Turcotte
 * Licensed under the MIT license.
 */

var events = require('events'),
    util = require('util');

function isDef(value) {
    return value !== undefined && value !== null;
}

/**
 * Fibonacci back off.
 */
function Backoff(options) {
    events.EventEmitter.call(this);
    options = options || {};

    if (isDef(options.initialDelay) && options.initialDelay < 1) {
        throw new Error('The initial timeout must be greater than 0.');
    } else if (isDef(options.maxDelay) && options.maxDelay < 1) {
        throw new Error('The maximal timeout must be greater than 0.');
    }

    this.initialDelay_ = options.initialDelay || 100;
    this.maxDelay_ = options.maxDelay || 10000;

    if (this.maxDelay_ <= this.initialDelay_) {
        throw new Error('The maximal timeout must be greater ' +
                        'than the initial timeout.');
    }

    if (isDef(options.randomisationFactor) &&
        (options.randomisationFactor < 0 || options.randomisationFactor > 1)) {
        throw new Error('The randomisation factor must be between 0 and 1.');
    }

    this.randomisationFactor_ = options.randomisationFactor || 0;

    this.backoffDelay_ = 0;
    this.randomizedDelay_ = 0;
    this.nextBackoffDelay_ = this.initialDelay_;

    this.backoffNumber_ = 0;
    this.timeoutID_ = -1;

    this.handlers = {
        backoff: this.onBackoff_.bind(this)
    };
}
util.inherits(Backoff, events.EventEmitter);

Backoff.prototype.backoff = function() {
    if (this.timeoutID_ !== -1) {
        throw new Error('Backoff in progress.');
    }

    this.backoffNumber_++;

    var backoffDelay = Math.min(this.nextBackoffDelay_, this.maxDelay_);
    this.nextBackoffDelay_ += this.backoffDelay_;
    this.backoffDelay_ = backoffDelay;

    var randomisationMultiple = 1 + Math.random() * this.randomisationFactor_;
    this.randomizedDelay_ = Math.round(backoffDelay * randomisationMultiple);

    this.timeoutID_ = setTimeout(this.handlers.backoff, this.randomizedDelay_);
};

Backoff.prototype.onBackoff_ = function() {
    this.timeoutID_ = -1;
    this.emit('backoff', this.backoffNumber_, this.randomizedDelay_);
};

Backoff.prototype.reset = function() {
    clearTimeout(this.timeoutID_);
    this.timeoutID_ = -1;
    this.backoffNumber_ = 0;
    this.nextBackoffDelay_ = this.initialDelay_;
    this.randomizedDelay_ = 0;
    this.backoffDelay_ = 0;
};

module.exports = Backoff;

