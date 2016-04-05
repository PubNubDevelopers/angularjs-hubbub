  var app = angular.module('app')  
  app.run(['ngNotify', function(ngNotify) {

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
