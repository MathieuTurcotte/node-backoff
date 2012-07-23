#!/usr/bin/env node

var Backoff = require('../backoff');

var backoff = new Backoff({
    initialDelay: 10,
    maxDelay: 1000
});

backoff.on('backoff', function(number, delay) {
    console.log('backoff #' + number + ' ' + delay + 'ms');

    if (number < 15) {
        backoff.backoff();
    }
});

backoff.backoff();
