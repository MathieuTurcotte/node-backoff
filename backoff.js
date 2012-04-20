/*
 * Copyright (c) 2012 Mathieu Turcotte
 * Licensed under the MIT license.
 */

var events = require('events'),
    util = require('util');

function ExponentialBackoff(options) {
    events.EventEmitter.call(this);

    var options = options || {};

    this.exponentialFactor = options.exponentialFactor || 2;
    this.initialTimeout = options.initialTimeout || 100;
    this.maxTimeout = options.maxTimeout || 10000;

    this.backoffInProgress = false;
    this.backoffNumber = 0;
    this.timeoutID = -1;
};
util.inherits(ExponentialBackoff, events.EventEmitter);

ExponentialBackoff.prototype.calculateBackoffDelay = function() {
    var multiplicativeFactor = Math.pow(this.exponentialFactor, this.backoffNumber);
    var delay = Math.min(this.initialTimeout * multiplicativeFactor, this.maxTimeout);
    return Math.round(delay);
};

ExponentialBackoff.prototype.backoff = function() {
    if (this.backoffInProgress) {
        return false;
    } else {
        var delay = this.calculateBackoffDelay();
        var onBackoff = this.onBackoff.bind(this, delay);
        this.timeoutID = setTimeout(onBackoff, delay);
        this.backoffInProgress = true;
        this.backoffNumber++;
        return true;
    }
};

ExponentialBackoff.prototype.onBackoff = function(delay) {
    this.backoffInProgress = false;
    this.emit('backoff', this.backoffNumber, delay);
};

ExponentialBackoff.prototype.reset = function() {
    this.backoffInProgress = false;
    clearTimeout(this.timeoutID);
    this.backoffNumber = 0;
    this.emit('reset');
};

module.exports = ExponentialBackoff;

