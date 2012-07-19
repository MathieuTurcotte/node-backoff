/*
 * Copyright (c) 2012 Mathieu Turcotte
 * Licensed under the MIT license.
 */

var events = require('events'),
    util = require('util');

function isDef(value) {
    return value !== undefined && value !== null;
}

function ExponentialBackoff(options) {
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
                        'than the the initial timeout.');
    }

    this.backoffInProgress_ = false;
    this.backoffNumber_ = 0;
    this.backoffDelay_ = 0;
    this.timeoutID_ = -1;

    this.handlers = {
        backoff: this.onBackoff_.bind(this)
    };
}
util.inherits(ExponentialBackoff, events.EventEmitter);

ExponentialBackoff.prototype.EXPONENT = 2;

ExponentialBackoff.prototype.updateBackoffDelay_ = function() {
    if (this.backoffDelay_ < this.maxTimeout_) {
        var factor = Math.pow(this.EXPONENT, this.backoffNumber_);
        var delay = Math.min(this.initialTimeout_ * factor, this.maxTimeout_);
        this.backoffDelay_ = Math.round(delay);
    }
};

ExponentialBackoff.prototype.backoff = function() {
    if (this.backoffInProgress_) {
        throw new Error('Backoff in progress.');
    }
    this.updateBackoffDelay_();
    this.timeoutID_ = setTimeout(this.handlers.backoff, this.backoffDelay_);
    this.backoffInProgress_ = true;
    this.backoffNumber_++;
};

ExponentialBackoff.prototype.onBackoff_ = function() {
    this.backoffInProgress_ = false;
    this.emit('backoff', this.backoffNumber_, this.backoffDelay_);
};

ExponentialBackoff.prototype.reset = function() {
    this.backoffInProgress_ = false;
    clearTimeout(this.timeoutID_);
    this.backoffNumber_ = 0;
    this.backoffDelay_ = 0;
    this.emit('reset');
};

module.exports = ExponentialBackoff;

