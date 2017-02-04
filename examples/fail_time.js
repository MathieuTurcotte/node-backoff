#!/usr/bin/env node

var backoff = require('../index');

var testBackoff = backoff.exponential({
    initialDelay: 10,
    maxDelay: 1000
});

testBackoff.failAfterTime(600);

var start;
testBackoff.on('backoff', function(number, delay) {
    console.log('Backoff start: ' + number + ' ' + delay + 'ms' +
                ' (' + (Date.now() - start) + 'ms elapsed)');
});

var callDelay = 50;
testBackoff.on('ready', function(number, delay) {
    console.log('Backoff done: ' + number + ' ' + delay + 'ms' +
                ' (' + (Date.now() - start) + 'ms elapsed)');
    setTimeout(function() {
        console.log('Simulated call delay: ' + callDelay + 'ms' +
                    ' (' + (Date.now() - start) + 'ms elapsed)');
        testBackoff.backoff(); // Launch a new backoff.
    }, callDelay);
});

testBackoff.on('fail', function() {
    console.log('Backoff failure.');
});

start = Date.now();
testBackoff.backoff();
