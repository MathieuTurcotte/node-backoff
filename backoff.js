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

    if (isDef(options.initialTimeout) && options.initialTimeout < 1) {
        throw new Error('The initial timeout must be greater than 0.');
    } else if (isDef(options.maxTimeout) && options.maxTimeout < 1) {
        throw new Error('The maximal timeout must be greater than 0.');
    }

    this.initialTimeout_ = options.initialTimeout || 100;
    this.maxTimeout_ = options.maxTimeout || 10000;

    if (this.maxTimeout_ <= this.initialTimeout_) {
        throw new Error('The maximal timeout must be greater ' +
                        'than the initial timeout.');
    }

    this.backoffNumber_ = 0;
    this.backoffDelay_ = 0;
    this.nextBackoffDelay_ = this.initialTimeout_;
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

    var backoffDelay = Math.min(this.nextBackoffDelay_, this.maxTimeout_);
    this.nextBackoffDelay_ += this.backoffDelay_;
    this.backoffDelay_ = backoffDelay;
    this.backoffNumber_++;

    this.timeoutID_ = setTimeout(this.handlers.backoff, this.backoffDelay_);
};

Backoff.prototype.onBackoff_ = function() {
    this.timeoutID_ = -1;
    this.emit('backoff', this.backoffNumber_, this.backoffDelay_);
};

Backoff.prototype.reset = function() {
    clearTimeout(this.timeoutID_);
    this.timeoutID_ = -1;
    this.backoffNumber_ = 0;
    this.nextBackoffDelay_ = this.initialTimeout_;
    this.backoffDelay_ = 0;
};

module.exports = Backoff;

