# Exponential backoff implementation for Node.js

An exponential backoff implementation for Node.js.

## Installation

```
npm install backoff
```
## Usage

The Backoff object inherits from EventEmitter. One can listen for
backoff completion by listening for 'backoff' events. Registered handlers
will be called with the current backoff number and delay.

``` js
var Backoff = require('backoff');

var backoff = new Backoff();

backoff.on('backoff', function(number, delay) {
    // Retry operation...
    backoff.backoff();
});

backoff.backoff();
```

It's also possible to reset 'Backoff' instance. Once reset, a 'Backoff'
instance can be reused. On reset, the 'reset' event will be emitted.

```js
var Backoff = require('backoff');

var backoff = new Backoff();

backoff.on('backoff', function(number, delay) {
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

