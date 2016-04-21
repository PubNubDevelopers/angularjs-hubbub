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
var github = require('octonode');
var _ = require('lodash');
var dotenv = require('dotenv').config()
var pubnub = require('pubnub');
var Q = require('q');

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

/*
 |--------------------------------------------------------------------------
 | Setting up PubNub
 |--------------------------------------------------------------------------
*/
  
  pubnub = pubnub.init({
    subscribe_key: process.env.PUBNUB_SUBSCRIBE_KEY,
    publish_key: process.env.PUBNUB_PUBLISH_KEY,
    secret_key: process.env.PUBNUB_SECRET_KEY,
    auth_key: 'NodeJS-Server',
    ssl: true
  });


/*
 |--------------------------------------------------------------------------
 | Authentication required middleware
 |--------------------------------------------------------------------------
 */

  function ensureAuthenticated(req, res, next) {
    if (!req.header('Authorization')) {
      return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
    }
    var token = req.header('Authorization').split(' ')[1];

    // Check if the OAUTH2 token has been previously authorized

    db.users.find({ oauth_token: token  }, function (err, users) {

      // Unauthorized
      if(_.isEmpty(users)){
        return res.status(401).send({ message: 'Unauthorized' });
      }
      // Authorized
      else{

         // Adding user information to the request
         req.user = users[0]
         next();
      }
    });
  }


/*
 |--------------------------------------------------------------------------
 | Login with GitHub
 |--------------------------------------------------------------------------
*/

  app.post('/auth/github', function(req, res) {

    var accessTokenUrl = 'https://github.com/login/oauth/access_token';

    var params = {
      code: req.body.code,
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      redirect_uri: req.body.redirectUri
    };

    // Exchange authorization code for access token.
    request.post({ url: accessTokenUrl, qs: params }, function(err, response, token) {

         var access_token = qs.parse(token).access_token;
         var github_client = github.client(access_token);

         // Retrieve profile information about the current user.
         github_client.me().info(function(err, profile){

            if(err){
                return res.status(400).send({ message: 'User not found' });
            }

            var github_id = profile['id'];
            var user = { _id: github_id, oauth_token: access_token }

            db.users.find({ _id: github_id  }, function (err, docs) {


              // The user doesn't have an account already
              if(_.isEmpty(docs)){

                // Create the user
                db.users.insert(user);

              }
              // Update the oauth2 token
              else{

                db.users.update({ _id: github_id }, { $set: { oauth_token: access_token } } )
              }

            });

           grantAccess(user).then(function(){
              res.send({token: access_token});
           }).catch(function(){
              res.status(500).send();
           })

         });

    });
  });
  
  /*
 |--------------------------------------------------------------------------
 | GET /api/friends
 |--------------------------------------------------------------------------
*/

  app.get('/api/friends', ensureAuthenticated, function(req, res) {

    var github_client = github.client(req.user.oauth_token);
    github_client.requestDefaults['qs'] = {page:1, per_page: 100};
    var ghme = github_client.me()

    ghme.followers(function(err, followers){

        if (!err && res.statusCode == 200){

          ghme.following(function(err, following){


              if (!err && res.statusCode == 200){ 

                var comparator = function(friend1, friend2){
                  return friend1.id == friend2.id
                };  

                var friends = _.unionWith(followers,following, comparator);

                // Each user are publishing is 

                res.status(200).send(friends); 

              }
              else{
                res.status(500).send();
              }
          }); 

        }
        else{
          res.status(500).send();
        }

    }); 

  });


  /*
 |--------------------------------------------------------------------------
 | Logout
 |--------------------------------------------------------------------------
*/
  
  app.post('/logout', ensureAuthenticated, function(req, res) {
    
    // Revoke access to the Access token
    // https://developer.github.com/v3/oauth_authorizations/#reset-an-authorization
    // POST /applications/:client_id/tokens/:access_token
    var resetTokenUrl = "https://api.github.com/applications/"+process.env.GITHUB_CLIENT_ID+'/tokens/'+ req.user.oauth_token;
    var authorization = new Buffer(process.env.GITHUB_CLIENT_ID + ":" + process.env.GITHUB_CLIENT_SECRET).toString("base64");

    var headers = { 
      "Authorization": "Basic "+authorization,
      'User-Agent': 'NodeJS'
    }

    // Revoke access to the token
    request.post({ url: resetTokenUrl, headers: headers }, function(err, response, payload) {
      if (!err && response.statusCode == 200){

             revokeAccess(req.user).then(function(){
              db.users.update({ oauth_token: req.user.oauth_token }, { $set: { oauth_token: null } } )
              res.status(200).send(); 
             }).catch(function(){
                res.status(500).send();
             })
      }
      else{
          res.status(500).send();
      }
    });

  });

/*
 |--------------------------------------------------------------------------
 | Get the list of protected channels
 |--------------------------------------------------------------------------
*/

  var getProtectedChannelList = function(user){
    return {
      'readOnly': [],
      'writeOnly': [],
      'readAndWrite': [
                        'messages',
                        'messages-pnpres',
                         user._id+'_presence',
                         user._id+'_presence-pnpres',
                      ]
    }
  };


/*
 |--------------------------------------------------------------------------
 | Get the list of protected channel groups
 |--------------------------------------------------------------------------
*/

  // There is no concept of write access with channel groups. 
  // You can only subscribe or manage a channel group
  var getProtectedChannelGroupList = function(user){
    return [
              user._id+'_friends_presence'
           ]
  };

/*
 |--------------------------------------------------------------------------
 | Grant access to an oauth token
 |--------------------------------------------------------------------------
*/


  var grantAccess = function(user){

      var grant = function(args){

        var deferred = Q.defer();
        args['callback'] = function(res){ deferred.resolve(res); }
        args['error'] = function(res){ deferred.reject(res); }
        pubnub.grant(args);
        return deferred.promise;

      }

      return grant({
              channel: getProtectedChannelList(user)['readAndWrite'], 
              auth_key: user.oauth_token, 
              read: true, 
              write: true,
              ttl: 0
            }).then(grant({
              channel_group: getProtectedChannelGroupList(user), 
              auth_key: user.oauth_token, 
              read: true, 
              ttl: 0
            }));
  };


  /*
 |--------------------------------------------------------------------------
 | Revoke access to an oauth token
 |--------------------------------------------------------------------------
*/

  var revokeAccess = function(user){

      var revoke = function(args){

        var deferred = Q.defer();
        args['callback'] = function(res){ deferred.resolve(res); }
        args['error'] = function(res){ deferred.reject(res); }
        pubnub.revoke(args);
        return deferred.promise;

      }

      return revoke({ 

          channel: getProtectedChannelList(user)['readAndWrite'], 
          auth_key: user.oauth_token
        
        }).then(revoke({
              
              channel_group: getProtectedChannelGroupList(user), 
              auth_key: user.oauth_token, 
        }));
  };


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
