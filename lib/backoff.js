//      Copyright (c) 2012 Mathieu Turcotte
//      Licensed under the MIT license.

var events = require('events');
var precond = require('precond');
var util = require('util');

// A class to hold the state of a backoff operation. Accepts a backoff strategy
// to generate the backoff delays.
function Backoff(backoffStrategy) {
    events.EventEmitter.call(this);

    this.backoffStrategy_ = backoffStrategy;
    this.maxNumberOfRetry_ = -1;
    this.maxTotalTime_ = Infinity;
    this.backoffNumber_ = 0;
    this.backoffStart_ = -1;
    this.backoffDelay_ = 0;
    this.timeoutID_ = -1;

    this.handlers = {
        backoff: this.onBackoff_.bind(this)
    };
}
util.inherits(Backoff, events.EventEmitter);

// Sets a limit, greater than 0, on the maximum number of backoffs. A 'fail'
// event will be emitted when the limit is reached.
Backoff.prototype.failAfter = function(maxNumberOfRetry) {
    precond.checkArgument(maxNumberOfRetry > 0,
        'Expected a maximum number of retry greater than 0 but got %s.',
        maxNumberOfRetry);

    this.maxNumberOfRetry_ = maxNumberOfRetry;
};

// Sets a time limit, in milliseconds, greater than 0, on the maximum time from
// the first backoff.  A 'fail' event will be emitted when a backoff is
// attempted after the limit is reached.  The limit may shorten the last
// backoff before the time limit is reached to avoid exceeding the limit.
Backoff.prototype.failAfterTime = function(maxTotalTime) {
    precond.checkArgument(maxTotalTime > 0,
        'Expected a maximum total time greater than 0 but got %s.',
        maxTotalTime);

    this.maxTotalTime_ = maxTotalTime;
};

// Starts a backoff operation. Accepts an optional parameter to let the
// listeners know why the backoff operation was started.
Backoff.prototype.backoff = function(err) {
    precond.checkState(this.timeoutID_ === -1, 'Backoff in progress.');

    var now = Date.now();
    if (this.backoffStart_ === -1) {
        this.backoffStart_ = now;
    }

    var timeLeft = this.maxTotalTime_ - (now - this.backoffStart_);
    if (this.backoffNumber_ === this.maxNumberOfRetry_ || timeLeft <= 0) {
        this.emit('fail', err);
        this.reset();
    } else {
        this.backoffDelay_ = Math.min(this.backoffStrategy_.next(), timeLeft);
        this.timeoutID_ = setTimeout(this.handlers.backoff, this.backoffDelay_);
        this.emit('backoff', this.backoffNumber_, this.backoffDelay_, err);
    }
};

// Handles the backoff timeout completion.
Backoff.prototype.onBackoff_ = function() {
    this.timeoutID_ = -1;
    this.emit('ready', this.backoffNumber_, this.backoffDelay_);
    this.backoffNumber_++;
};

// Stops any backoff operation and resets the backoff delay to its inital value.
Backoff.prototype.reset = function() {
    this.backoffNumber_ = 0;
    this.backoffStart_ = -1;
    this.backoffStrategy_.reset();
    clearTimeout(this.timeoutID_);
    this.timeoutID_ = -1;
};

module.exports = Backoff;
