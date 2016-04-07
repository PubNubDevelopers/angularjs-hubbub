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
    var initChat = function(currentUser, Pubnub, $auth){

      return currentUser.fetch().then(function(user){

        Pubnub.set_uuid(user.id) 
        Pubnub.auth($auth.getToken())

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