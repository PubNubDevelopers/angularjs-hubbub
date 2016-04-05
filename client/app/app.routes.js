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

    $routeProvider
      .when('/', {
        templateUrl: 'views/chat.html',
        resolve: { requireAuthentication: requireAuthentication }
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