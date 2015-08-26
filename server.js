var fs = require('fs');
var path = require('path');
var express = require('express');
var favicon = require('serve-favicon');

var app = express();

// app.set('view engine', 'jade');
// app.set('views', path.join(__dirname, 'views'));

// app.use(express.static(path.join(__dirname, '/app')));
app.use(express.static(path.join(__dirname, '/dist'))); // eventually everything should be served from there
app.use(favicon(__dirname + '/app/images/touch/chrome-touch-icon-192x192.png'));
//app.use('/bower_components', express.static(__dirname + '/bower_components'));

/* GET home page. */
app.get('/raw', function(req, res, next) {
    console.log("req app", req.hostname, req.app.settings.port);
    fs.readFile(__dirname + '/../app/index.html', 'utf8', function(err, text){
        res.send("Hi miezan");
    });
});

module.exports = app;
