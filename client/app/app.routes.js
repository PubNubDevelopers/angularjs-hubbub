angular
  .module('app')  
  .config(function ($routeProvider, $authProvider) {
 
    // Redirect to the login page if not authenticated
    var requireAuthentication = function ($location, $auth, AuthenticationService) {

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
        controller: function(AuthenticationService, $location, ngNotify){          
              
            AuthenticationService.logout().catch(function(error) {
              // The logging out process failed on the server side
              if(error.status == 500){
                ngNotify.set('Logout failed.', { type: 'error' }); 
              }    
            }).finally(function(){
              $location.path('/login');
            });
            
        }
      })
      .otherwise({
        redirectTo: '/'
      });
  })