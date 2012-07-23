# Backoff for Node.js [![Build Status](https://secure.travis-ci.org/MathieuTurcotte/node-backoff.png?branch=master)](http://travis-ci.org/MathieuTurcotte/node-backoff)

Fibonnaci backoff implementation for Node.js.

## Installation

```
npm install backoff
```
## Usage

In order to use backoff, require `backoff`.

```js
var Backoff = require('backoff');
```

`Backoff` inherits from `EventEmitter`. One can listen for backoff completion
by listening for `backoff` events. Registered handlers will be called with the
current backoff number and delay.

``` js
var backoff = new Backoff({
    randomisationFactor: 0,
    initialDelay: 10,
    maxDelay: 1000
});

backoff.on('backoff', function(number, delay) {
    console.log(number + ' ' + delay + 'ms');

    if (number < 12) {
        backoff.backoff();
    }
});

backoff.backoff();
```

The previous example would print:

```
1 10ms
2 10ms
3 20ms
4 30ms
5 50ms
6 80ms
7 130ms
8 210ms
9 340ms
10 550ms
11 890ms
12 1000ms
```

Backoff objects are meant to be instantiated once and reused several times
by calling `reset` after each successful backoff operation.

## API

### new Backoff([options])

Construct a new backoff object.

`options` is an object with the following defaults:

```js
options = {
    randomisationFactor: 0,
    initialDelay: 100,
    maxDelay: 10000
};
```

With these values, the backoff delay will increase from 100ms to 10000ms. The
randomisation factor control the range of randomness and  must be between 0
and 1. By default, no randomisation is applied on the backoff delay.

### backoff.backoff()

Start a backoff operation. Will throw an error if a backoff operation is already
in progress.

In practice, this method should be called after a failed attempt to perform a
sensitive operation (connecting to a database, downloading a resource over the
network, etc.).

### backoff.reset()

Reset the backoff delay to the initial backoff delay and stop any backoff
operation in progress. After reset, a backoff instance can and should be
reused.

In practice, this method should be called after having successfully completed
the sensitive operation guarded by the backoff instance or if the client code
request to stop any reconnection attempt.

### Event: 'backoff'

- number: number of backoff since last reset
- delay: current backoff delay

Emitted on backoff completion, effectively signaling that the failing operation
should be retried.

## License

This code is free to use under the terms of the [MIT license](http://mturcotte.mit-license.org/).
