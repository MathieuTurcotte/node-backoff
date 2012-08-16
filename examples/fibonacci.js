#!/usr/bin/env node

var backoff = require('../index');

var testBackoff = backoff.fibonacci({
    initialDelay: 10,
    maxDelay: 1000
});

testBackoff.on('start', function(number, delay) {
    console.log('Backoff start: ' + number + ' ' + delay + 'ms');
});

testBackoff.on('done', function(number, delay) {
    console.log('Backoff done: ' + number + ' ' + delay + 'ms');

    if (number < 15) {
        testBackoff.backoff();
    }
});

testBackoff.backoff();

