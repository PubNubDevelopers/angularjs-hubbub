angular
  .module('app')  
  .config(function ($routeProvider, $authProvider) {
 
    // Redirect to the login page if not authenticated
    var requireAuthentication = function ($q, $location, $auth, AuthenticationService) {

      if ($auth.isAuthenticated()) {
        return AuthenticationService.login()
      } else {
        return $location.path('/login');
      }
    };

    $routeProvider
      .when('/', {
        templateUrl: 'views/chat.html',
        resolve: { 
                    requireAuthentication: requireAuthentication
                  }

      })
      .when('/login', {
        templateUrl: 'views/login.html'
      })
      .when('/logout', { 
        template: null,
        controller: function(AuthenticationService, $location){          
              
            AuthenticationService.logout().then(function(){
                
                $location.path('/login');

            });
            
        }
      })
      .otherwise({
        redirectTo: '/'
      });
  })