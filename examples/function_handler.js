#!/usr/bin/env node

var backoff = require('../index.js'),
    http = require('http');

function get(options, callback) {
    http.get(options, function(res) {
        res.setEncoding('utf8');
        res.data = '';
        res.on('data', function (chunk) {
            res.data += chunk;
        });
        res.on('end', function() {
            callback(null, res);
        });
        res.on('close', function(err) {
            callback(err, res);
        });
    }).on('error', function(err) {
        callback(err, null);
    });
}

var bget = backoff.wrap(get);

bget('http://www.iana.org/domains/example/', function(err, res, results) {
    console.log('Retries: ' + results.length);
    if (err) {
        console.log('Error: ' + err.message);
    } else {
        console.log('Status: ' + res.statusCode);
    }
});

