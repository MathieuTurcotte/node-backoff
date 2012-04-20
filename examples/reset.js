#!/usr/bin/env node

var Backoff = require('../backoff');

var backoff = new Backoff();

backoff.on('backoff', function(number, delay) {
    console.log('backoff #' + number + ' ' + delay + 'ms');

    if (number < 15) {
        backoff.backoff();
    }
});

backoff.on('reset', function() {
    console.log('backoff reset');
    backoff.backoff();
});

backoff.backoff();

setTimeout(function() {
    backoff.reset();
}, 5000);
