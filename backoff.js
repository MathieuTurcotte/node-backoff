/*
 * Copyright (c) 2012 Mathieu Turcotte
 * Licensed under the MIT license.
 */

var events = require('events'),
    util = require('util');

function ExponentialBackoff(options) {
    events.EventEmitter.call(this);

    var options = options || {};

    if (options.initialTimeout != undefined && options.initialTimeout < 1) {
        throw new Error('The initial timeout must be greater than 0.');
    } else if (options.maxTimeout != undefined && options.maxTimeout < 1) {
        throw new Error('The maximal timeout must be greater than 0.');
    }

    this.initialTimeout = options.initialTimeout || 100;
    this.maxTimeout = options.maxTimeout || 10000;

    if (this.maxTimeout <= this.initialTimeout) {
        throw new Error('The maximal timeout must be greater ' +
                        'than the the initial timeout.');
    }

    this.backoffInProgress = false;
    this.backoffNumber = 0;
    this.backoffDelay = 0;
    this.timeoutID = -1;

    this.handlers = {
        backoff: this.onBackoff.bind(this)
    };
};
util.inherits(ExponentialBackoff, events.EventEmitter);

ExponentialBackoff.prototype.EXPONENTIAL_FACTOR = 2;

ExponentialBackoff.prototype.updateBackoffDelay = function() {
    if (this.backoffDelay < this.maxTimeout) {
        var multiplicativeFactor = Math.pow(this.EXPONENTIAL_FACTOR, this.backoffNumber);
        var delay = Math.min(this.initialTimeout * multiplicativeFactor, this.maxTimeout);
        this.backoffDelay = Math.round(delay);
    }
};

ExponentialBackoff.prototype.backoff = function() {
    if (this.backoffInProgress) {
        throw new Error('Backoff in progress.');
    }
    this.updateBackoffDelay();
    this.timeoutID = setTimeout(this.handlers.backoff, this.backoffDelay);
    this.backoffInProgress = true;
    this.backoffNumber++;
};

ExponentialBackoff.prototype.onBackoff = function(delay) {
    this.backoffInProgress = false;
    this.emit('backoff', this.backoffNumber, this.backoffDelay);
};

ExponentialBackoff.prototype.reset = function() {
    this.backoffInProgress = false;
    clearTimeout(this.timeoutID);
    this.backoffNumber = 0;
    this.backoffDelay = 0;
    this.emit('reset');
};

module.exports = ExponentialBackoff;

