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
 
  console.log('------------ Initing PubNub ----------------')
  pubnub = pubnub.init({
    subscribe_key: process.env.PUBNUB_SUBSCRIBE_KEY,
    publish_key: process.env.PUBNUB_PUBLISH_KEY,
    secret_key: process.env.PUBNUB_SECRET_KEY,
    auth_key: process.env.SERVER_PUBNUB_AUTH_KEY,
    ssl: true,
    error: function(err){ console.log(err) }
  });

  // Grant to the SERVER_AUTH_KEY the manage permission in order to beeing able to add/remove channels to any channel group.
  console.log('------------ Granting channel group manage permission to the server ----------------')
  pubnub.grant({
                  channel_group: ':',  // The wildcard ':' will grant access to any channel group
                  auth_key: process.env.SERVER_PUBNUB_AUTH_KEY, 
                  manage: true, 
                  read: true,
                  write: true,
                  ttl: 0,
                  callback: function(res){ console.log(res) },
                  error: function(err){ console.log(err) }
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

                var friends = _.unionWith(followers,following, function(friend1,friend2){
                    return friend1.id == friend2.id
                });

                friends.push({
                  "login": "pubnub",
                  "id": 297109,
                  "avatar_url": "https://avatars.githubusercontent.com/u/297109?v=3",
                  "location": "San Francisco, CA",
                  "email": "help@pubnub.com"
                })

                // We merge to the friends objects the name of the channel used for the direct conversation
                var friends = _.map(friends, function(friend){
                  return _.merge(friend, { direct_conversation_channel: getDirectConversationChannelName(friend.id, req.user._id) })    
                })
                
                Q.all([
                        createOwnUserConversationsChannelGroup(req.user, friends),
                        createOwnUserFriendsPresenceChannelGroup(req.user, friends),
                        allowUserToPublishToConversationChannels(req.user, friends)
                      ]).then(function(){
                          res.status(200).send(friends);
                      }).catch(function(){
                           res.status(500).send();
                      })

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
 | GET /api/conversation
 |--------------------------------------------------------------------------
*/

  app.get('/api/conversations', ensureAuthenticated, function(req, res) {

    var conversations = [
      { name: 'General', parameterized_name: 'general', type: 'channel', channel: 'conversation_channel_general' },
      { name: 'Random', parameterized_name: 'random', type: 'channel', channel: 'conversation_channel_random' },
      { name: 'Questions', parameterized_name: 'questions', type: 'channel', channel: 'conversation_channel_questions' },
      { name: 'AngularJS', parameterized_name: 'angularjs', type: 'channel', channel: 'conversation_channel_angularjs' },
      { name: 'PubNub', parameterized_name: 'pubnub', type: 'channel', channel: 'conversation_channel_pubnub' }
    ]

    conversationsChannels = _.map(conversations, function(conversation){ return conversation.channel });

    // Allow the user to publish in the channels
    var allowUserToPublishInChannelsPromise =  grant({
              channel: conversationsChannels, 
              auth_key: req.user.oauth_token, 
              read: true, 
              write: true,
              ttl: 0
            })


    Q.all([ 
      addConversationsToConversationChannelGroup(req.user, conversationsChannels), 
      allowUserToPublishInChannelsPromise
    ])
    .then(function(){

      res.status(200).send(conversations);

    })
    .catch(function(){
      
      res.status(500).send();
    
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
                        'user_presence_' + user._id,
                        'user_presence_' + user._id + '-pnpres',
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
    return _.join([
                    'friends_presence_'+ user._id ,
                    'friends_presence_'+ user._id + '-pnpres',
                    'conversations_'+ user._id ,
                    'conversations_'+ user._id + '-pnpres'
                  ],',')
  };



/*
 |--------------------------------------------------------------------------
 | Grant access to a channel or a channel group
 | - return a promise
 |--------------------------------------------------------------------------
*/

  var grant = function(args){

    var deferred = Q.defer();
    args['callback'] = function(res){ deferred.resolve(res); }
    args['error'] = function(res){ deferred.reject(res); }
    pubnub.grant(args);
    return deferred.promise;

  }

/*
 |--------------------------------------------------------------------------
 | Grant access to an oauth token
 |--------------------------------------------------------------------------
*/


  var grantAccess = function(user){

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
   | Add the given conversations to the user conversation channel group
   |--------------------------------------------------------------------------
  */
  
  var addConversationsToConversationChannelGroup = function(user, conversations){

      var deferred = Q.defer();

      // The name of the channel used by the user to group all the conversations
      var user_conversation_channel_group = 'conversations_' + user._id;

      pubnub.channel_group_add_channel({
        callback: function(res){ deferred.resolve(res)},
        error: function(res){ deferred.reject(res) },
        channel_group: user_conversation_channel_group,
        channel: conversations
      }); 

      return deferred.promise;

  }


  /*
   |--------------------------------------------------------------------------
   | Create the own user friends channel group
   |--------------------------------------------------------------------------
  */

  // All the friends are automatically publishing their presence status to their own presence channel called userID_presence
  // We aggregate their presence events in the own user channel group called userID_friends_presence
  // The user subscribe to this channel group to to see his friends online/offline status be updated in realtime. 
  
  var createOwnUserFriendsPresenceChannelGroup = function(user, friends){

      var deferred = Q.defer();
        
      var friends_presence_channels = _.map(friends, function(friend){ return "user_presence_" + friend.id });
      var user_friends_presence_channel = 'friends_presence_' + user._id

      pubnub.channel_group_add_channel({
        callback: function(res){ deferred.resolve(res) },
        error: function(res){ deferred.reject(res) },
        channel_group: user_friends_presence_channel,
        channel: friends_presence_channels
      }); 

      return deferred.promise;

  }

  /*
   |--------------------------------------------------------------------------
   | Create the own user channel group
   |--------------------------------------------------------------------------
  */

  // All the friends are automatically publishing their presence status to their own presence channel called userID_presence
  // We aggregate their presence events in the own user channel group called userID_friends_presence
  // The user subscribe to this channel group to to see his friends online/offline status be updated in realtime. 
  
  var createOwnUserFriendsPresenceChannelGroup = function(user, friends){

      var deferred = Q.defer();
        
      var friends_presence_channels = _.map(friends, function(friend){ return "user_presence_" + friend.id });
      var user_friends_presence_channel = 'friends_presence_' + user._id

      pubnub.channel_group_add_channel({
        callback: function(res){ deferred.resolve(res) },
        error: function(res){ deferred.reject(res) },
        channel_group: user_friends_presence_channel,
        channel: friends_presence_channels
      }); 

      return deferred.promise;

  }

  /*
   |--------------------------------------------------------------------------
   | Create the own user conversations channel group
   |--------------------------------------------------------------------------
  */

  // All the friends are automatically publishing their presence status to their own presence channel called userID_presence
  // We aggregate their presence events in the own user channel group called userID_friends_presence
  // The user subscribe to this channel group to to see his friends online/offline status be updated in realtime. 
  
  var createOwnUserConversationsChannelGroup = function(user, friends){

      var deferred = Q.defer();
      
      // The list of channels used for the 1-1 conversations
      var direct_conversation_channels = _.map(friends, function(friend){
        return getDirectConversationChannelName(user._id, friend.id) 
      });

      // The name of the channel used by the user to group all the conversations
      var user_conversation_channel_group = 'conversations_' + user._id;

      pubnub.channel_group_add_channel({
        callback: function(res){ deferred.resolve(res) },
        error: function(res){ deferred.reject(res) },
        channel_group: user_conversation_channel_group,
        channel: direct_conversation_channels
      }); 

      return deferred.promise;

  }


    /*
   |--------------------------------------------------------------------------
   | Allow the user to publish to his conversations channels
   |--------------------------------------------------------------------------
  */

   // This method allow the user to publish to its conversation channels 
   // By granting the access to all the channels

   var allowUserToPublishToConversationChannels = function(user, friends){

      return grant({
              channel: getDirectConversationChannelList(user, friends), 
              auth_key: user.oauth_token, 
              read: true, 
              write: true,
              ttl: 0
            });

   }; 



  /*
   |--------------------------------------------------------------------------
   | Get from a list of channels the presence channels
   |--------------------------------------------------------------------------
  */

  var getPresenceChannelsFromChannelList = function(channels){

      return _.map(channels, function(channel){
         return channel+'-pnpres';
     }) 
  }


  /*
   |--------------------------------------------------------------------------
   | Get the list of the direct conversations channels of the user based on his friends
   |--------------------------------------------------------------------------
  */

  var getDirectConversationChannelList = function(user, friends){

      return _.map(friends, function(friend){
         return getDirectConversationChannelName(user._id, friend.id);
     }) 
  }


  /*
   |--------------------------------------------------------------------------
   | Get the name of the direct conversation between two user
   |--------------------------------------------------------------------------
  */

  // This function return the name of the channel used for a 1-1 chat between two people
  // The pattern is : conversation_direct_userID1_userID2
  // With user userID1 alphabetically lower than userID2
  
  var getDirectConversationChannelName = function(userID1, userID2){

    var order = userID1.toString() < userID2.toString();
    var usersCombined = order ? userID1 +'_' + userID2 : userID2 + '_' + userID1

    return "conversation_direct_" + usersCombined;

  }



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
