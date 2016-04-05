angular
  .module('app')  
  .config(function ($routeProvider, $authProvider) {
 
    // Redirect to the login page if not authenticated
    var requireAuthentication = function ($q, $location, $auth) {
      var deferred = $q.defer();
      if ($auth.isAuthenticated()) {
        deferred.resolve();
      } else {
        $location.path('/login');
      }
      return deferred.promise;
    };

    // Init the chat
    var initChat = function(currentUser, config, Pubnub){

      return currentUser.fetch().then(function(user){
        Pubnub.init({
                      publish_key: config.PUBNUB_PUBLISH_KEY,
                      subscribe_key: config.PUBNUB_SUBSCRIBE_KEY,
                      uuid: user.id,
                      origin: 'pubsub.pubnub.com',
                      ssl: true,
                      heartbeat: 40,
                      heartbeat_interval: 60
                  });

      });

    };

    $routeProvider
      .when('/', {
        templateUrl: 'views/chat.html',
        resolve: { 
                    requireAuthentication: requireAuthentication,
                    initChat: initChat
                  }

      })
      .when('/login', {
        templateUrl: 'views/login.html'
      })
      .when('/logout', { 
        template: null,
        controller: function($location, $auth){
          if ($auth.isAuthenticated()) { $auth.logout() }
          $location.path('/login');
        }
      })
      .otherwise({
        redirectTo: '/'
      });
  })