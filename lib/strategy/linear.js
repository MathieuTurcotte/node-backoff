//      Copyright (c) 2012 Mathieu Turcotte
//      Licensed under the MIT license.

var util = require('util');
var precond = require('precond');

var BackoffStrategy = require('./strategy');

// Linear backoff strategy.
function LinearBackoffStrategy(options) {
    BackoffStrategy.call(this, options);
    this.backoffDelay_ = 0;
    this.nextBackoffDelay_ = this.getInitialDelay();
    this.factor_ = LinearBackoffStrategy.DEFAULT_FACTOR;

    if (options && options.factor !== undefined) {
        precond.checkArgument(options.factor > 0,
            'Linear factor should be greater than 0 but got %s.',
            options.factor);
        this.factor_ = options.factor;
    }
}
util.inherits(LinearBackoffStrategy, BackoffStrategy);

// Default addition factor used to compute the next backoff delay from
// the current one. The value can be overridden by passing a custom
// factor as part of the options. Given in milliseconds.
LinearBackoffStrategy.DEFAULT_FACTOR = 5;

LinearBackoffStrategy.prototype.next_ = function() {
    this.backoffDelay_ = Math.min(this.nextBackoffDelay_, this.getMaxDelay());
    this.nextBackoffDelay_ = this.backoffDelay_ + this.factor_;
    return this.backoffDelay_;
};

LinearBackoffStrategy.prototype.reset_ = function() {
    this.backoffDelay_ = 0;
    this.nextBackoffDelay_ = this.getInitialDelay();
};

module.exports = LinearBackoffStrategy;
