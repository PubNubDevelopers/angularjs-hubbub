angular.module('app')
  .run(['Pubnub','currentUser', 'config', function(Pubnub, currentUser, config) {
    
    Pubnub.init({
                    publish_key: config.PUBNUB_PUBLISH_KEY,
                    subscribe_key: config.PUBNUB_SUBSCRIBE_KEY,
                    origin: 'pubsub.pubnub.com',
                    ssl: true,
                    heartbeat: 200,
                    heartbeat_interval: 98
    });

  }])
  .run(['ngNotify', function(ngNotify) {

      ngNotify.config({
          theme: 'paster',
          position: 'top',
          duration: 250
      });

      ngNotify.addType('messages-all-fetched', 'ngn-messages-all-fetched');
      ngNotify.addType('fetching-messages', 'ngn-fetching-messages');

  }])
  .config(['$authProvider','config', function($authProvider, config) {

    $authProvider.github({
      clientId: config.GITHUB_CLIENT_ID,
      redirectUri: config.GITHUB_REDIRECT_URI,
      url: config.GITHUB_ACCESS_TOKEN_REQUEST_URL,
    });

    $authProvider.httpInterceptor = true;

  }]);