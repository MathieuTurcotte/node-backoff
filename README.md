# Backoff for Node.js [![Build Status](https://secure.travis-ci.org/MathieuTurcotte/node-backoff.png?branch=master)](http://travis-ci.org/MathieuTurcotte/node-backoff)

Fibonacci and exponential backoffs for Node.js.

## Installation
```
npm install backoff
```
## Usage

In order to use backoff, require `backoff`.

```js
var backoff = require('backoff');
```

The usual way to instantiate a new `Backoff` object is to use one predefined
factory method: `backoff.fibonacci([options])`, `backoff.exponential([options])`.

`Backoff` inherits from `EventEmitter`. When a backoff starts, a `backoff`
event is emitted and, when a backoff ends, a `ready` event is emitted.
Handlers for these two events are called with the current backoff number and
delay.

``` js
var fibonacciBackoff = backoff.fibonacci({
    randomisationFactor: 0,
    initialDelay: 10,
    maxDelay: 1000
});

fibonacciBackoff.on('backoff', function(number, delay) {
    // Do something when backoff starts.
    console.log(number + ' ' + delay + 'ms');
});

fibonacciBackoff.on('ready', function(number, delay) {
    // Do something when backoff ends.
    if (number < 15) {
        fibonacciBackoff.backoff();
    }
});

fibonacciBackoff.backoff();
```

The previous example would print:

```
0 10ms
1 10ms
2 20ms
3 30ms
4 50ms
5 80ms
6 130ms
7 210ms
8 340ms
9 550ms
10 890ms
11 1000ms
12 1000ms
13 1000ms
14 1000ms
15 1000ms
```

Backoff objects are meant to be instantiated once and reused several times
by calling `reset` after a successful "retry".

## API

### backoff.fibonacci([options])

Constructs a Fibonacci backoff (10, 10, 20, 30, 50, etc.).

See bellow for the options description.

### backoff.exponential([options])

Constructs an exponential backoff (10, 20, 40, 80, etc.).

The options are:

- randomisationFactor: defaults to 0, must be between 0 and 1
- initialDelay: defaults to 100 ms
- maxDelay: defaults to 10000 ms

With these values, the backoff delay will increase from 100 ms to 10000 ms. The
randomisation factor controls the range of randomness and must be between 0
and 1. By default, no randomisation is applied on the backoff delay.

### Class Backoff

#### new Backoff(strategy)

- strategy: the backoff strategy to use

Constructs a new backoff object from a specific backoff strategy. The backoff
strategy must implement the `BackoffStrategy`interface defined bellow.

#### backoff.backoff()

Starts a backoff operation. Will throw an error if a backoff operation is
already in progress.

In practice, this method should be called after a failed attempt to perform a
sensitive operation (connecting to a database, downloading a resource over the
network, etc.).

#### backoff.reset()

Resets the backoff delay to the initial backoff delay and stop any backoff
operation in progress. After reset, a backoff instance can and should be
reused.

In practice, this method should be called after having successfully completed
the sensitive operation guarded by the backoff instance or if the client code
request to stop any reconnection attempt.

#### Event: 'backoff'

- number: number of backoffs since last reset, starting at 0
- delay: backoff delay in milliseconds

Emitted when a backoff operation is started. Signals to the client how long
the next backoff delay will be.

#### Event: 'ready'

- number: number of backoffs since last reset, starting at 0
- delay: backoff delay in milliseconds

Emitted when a backoff operation is done. Signals that the failing operation
should be retried.

### Interface BackoffStrategy

A backoff strategy must provide the following methods.

#### strategy.next()

Computes and returns the next backoff delay.

#### strategy.reset()

Resets the backoff delay to its initial value.

### Class ExponentialStrategy

Exponential (10, 20, 40, 80, etc.) backoff strategy implementation.

#### new ExponentialStrategy([options])

The options are:

- randomisationFactor: defaults to 0, must be between 0 and 1
- initialDelay: defaults to 100 ms
- maxDelay: defaults to 10000 ms

### Class FibonacciStrategy

Fibonnaci (10, 10, 20, 30, 50, etc.) backoff strategy implementation.

#### new FibonacciStrategy([options])

The options are:

- randomisationFactor: defaults to 0, must be between 0 and 1
- initialDelay: defaults to 100 ms
- maxDelay: defaults to 10000 ms

## License

This code is free to use under the terms of the [MIT license](http://mturcotte.mit-license.org/).
