#!/usr/bin/env node

var backoff = require('../index');

var backoff = backoff.exponential();

backoff.on('backoff', function(number, delay) {
    console.log('backoff #' + number + ' ' + delay + 'ms');

    if (number < 15) {
        backoff.backoff();
    }
});

backoff.backoff();

setInterval(function() {
    backoff.reset();
    backoff.backoff();
}, 5000);
