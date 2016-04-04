var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
var http = require("http");
var parseUrlencoded = bodyParser.urlencoded({ extended: false });
var request = require('request');
var qs = require('querystring');
var Datastore = require('nedb')

var app = express();

// view engine setup

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(cors());


/*
 |--------------------------------------------------------------------------
 | Setting up the DB
 |--------------------------------------------------------------------------
*/

db = {};
db.users = new Datastore({ filename: 'db/users.db', autoload: true });
db.access_tokens = new Datastore({ filename: 'db/access_tokens.db', autoload: true });

/*
 |--------------------------------------------------------------------------
 | Login with GitHub
 |--------------------------------------------------------------------------
*/

  app.post('/auth/github', function(req, res) {

    var accessTokenUrl = 'https://github.com/login/oauth/access_token';

    var params = {
      code: req.body.code,
      client_id: req.body.clientId,
      client_secret: '3c69fde2d90e34e6ccc7eafd5920bf51d0f540e0',
      redirect_uri: req.body.redirectUri
    };

    // Exchange authorization code for access token.
    request.post({ url: accessTokenUrl, qs: params }, function(err, response, token) {

         token = qs.parse(token);
         accessToken = token.accessToken;

         res.send({token: token.access_token});
    });
  });


/*
 |--------------------------------------------------------------------------
*/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500).send({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500).send({
    message: err.message,
    error: {}
  });
});


module.exports = app;
