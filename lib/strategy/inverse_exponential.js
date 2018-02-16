var util = require('util');
var precond = require('precond');

var BackoffStrategy = require('./strategy');

// Inverse Exponential backoff strategy.
function InverseExponentialBackoffStrategy (options) {
  BackoffStrategy.call(this, options);
  this.backoffDelay_ = 512;
  this.nextBackoffDelay_ = this.getInitialDelay();
  this.factor_ = InverseExponentialBackoffStrategy.DEFAULT_FACTOR;

  if (options && options.factor !== undefined) {
    precond.checkArgument(options.factor > 1,
      'Exponential factor should be greater than 1 but got %s.',
      options.factor);
    this.factor_ = options.factor;
  }
}
util.inherits(InverseExponentialBackoffStrategy, BackoffStrategy);

// Default division factor used to compute the next backoff delay from
// the current one. The value can be overridden by passing a custom factor as
// part of the options.
InverseExponentialBackoffStrategy.DEFAULT_FACTOR = 2;

InverseExponentialBackoffStrategy.prototype.next_ = function () {
  this.backoffDelay_ = Math.max(this.nextBackoffDelay_, 0);
  this.nextBackoffDelay_ = parseInt(this.backoffDelay_ / this.factor_);
  return this.backoffDelay_;
};

InverseExponentialBackoffStrategy.prototype.reset_ = function () {
  this.backoffDelay_ = 512;
  this.nextBackoffDelay_ = this.getInitialDelay();
};

module.exports = InverseExponentialBackoffStrategy;
