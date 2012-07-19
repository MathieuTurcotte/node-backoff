# Exponential backoff for Node.js [![Build Status](https://secure.travis-ci.org/MathieuTurcotte/node-backoff.png?branch=master)](http://travis-ci.org/MathieuTurcotte/node-backoff)

An exponential backoff implementation for Node.js.

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
    initialTimeout: 10,
    maxTimeout: 1000
});

backoff.on('backoff', function(number, delay) {
    console.log(number + ' ' + delay + 'ms');

    if (number < 10) {
        backoff.backoff();
    }
});

backoff.backoff();
```

The previous example would print:

```
1 10ms
2 20ms
3 40ms
4 80ms
5 160ms
6 320ms
7 640ms
8 1000ms
9 1000ms
10 1000ms
```

Backoff objects are meant to be instantiated once and reused several times
by calling `reset` after each successful backoff operation.

## API

### new Backoff([options])

Construct a new backoff object.

`options` is an object with the following defaults:

```js
options = {
    initialTimeout: 100,
    maxTimeout: 10000
};
```

With these values, the timeout delay will exponentially increase from 100ms to
10000ms.

### backoff.backoff()

Start a backoff operation, doubling the previous timeout delay. Will return
true on success and false if a backoff operation was already in progress.

In practice, this method should be called after a failed attempt to perform a
sensitive operation (connecting to a database, downloading a resource over the
network, etc.).

### backoff.reset()

Reset the timeout delay to the initial timeout value and stop any backoff
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

### Event: 'reset'

Emitted when a backoff instance is reseted.

## License

This code is free to use under the terms of the [MIT license](http://mturcotte.mit-license.org/).
