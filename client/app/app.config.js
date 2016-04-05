  var app = angular.module('app')
  app.run(['Pubnub','currentUser','config', function(Pubnub, currentUser, config) {

    Pubnub.init({
          publish_key: config.PUBNUB_SUBSCRIBE_KEY,
          subscribe_key: config.PUBNUB_SUBSCRIBE_KEY,
          uuid: currentUser,
          origin: 'pubsub.pubnub.com',
          ssl: true,
          heartbeat: 40,
          heartbeat_interval: 60
      });

  }])
  .run(['ngNotify', function(ngNotify) {

      ngNotify.config({
          theme: 'paster',
          position: 'top',
          duration: 250
      });

  }])
  .config(['$authProvider','config', function($authProvider, config) {


    $authProvider.github({
      clientId: config.GITHUB_CLIENT_ID,
      redirectUri: config.GITHUB_REDIRECT_URI,
      url: config.GITHUB_ACCESS_TOKEN_REQUEST_URL,
    });

  }]);
