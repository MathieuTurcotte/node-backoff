# Exponential backoff implementation for Node.js

An exponential backoff implementation for Node.js.

## Installation

```
npm install backoff
```
## Usage

When requiring `backoff`, you'll get the `Backoff` constructor.

```js
var Backoff = require('backoff');
```

`Backoff` inherits from `EventEmitter`. One can listen for backoff completion
by listening for `backoff` events. Registered handlers will be called with the
current backoff number and delay.

``` js
var backoff = new Backoff();

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

It's also possible to reset `Backoff` instances, so that they can be reused.
Upon reset, the `reset` event will be emitted.

```js
var backoff = new Backoff();

backoff.on('backoff', function(number, delay) {
    console.log(number + ' ' + delay + 'ms');
    backoff.backoff();
});

backoff.on('reset', function() {
    console.log('reset');
});

backoff.backoff();

setTimeout(function() {
    backoff.reset();
}, 5000);
```

Optionally, one can configure the backoff `initialTimeout` and `maxTimeout`
value.  For example, the following backoff will start with a timeout of 10 ms
and exponentially increase its value until it reaches 1000 ms.

```js
var backoff = new Backoff({
    initialTimeout: 10,
    maxTimeout: 1000
});
```

## API

### backoff.backoff()

Starts a backoff operation, doubling the previous timeout. Returns true on
success and false if a backoff was already in progress.

### backoff.reset()

Resets the backoff object state. If a backoff operation is in progress when
called, it will be stop.

### Event: 'backoff'

- number: number of backoff since last reset
- delay: current backoff delay

Emitted on backoff completion.

### Event: 'reset'

Emitted when a backoff instance is reset.
