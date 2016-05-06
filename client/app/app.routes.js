angular
  .module('app')  
  .config(function ($stateProvider, $urlRouterProvider, $authProvider) {
 
    // Redirect to the login page if not authenticated
    var requireAuthentication = function ($location, $auth, AuthenticationService) {

      if ($auth.isAuthenticated()) {
        return AuthenticationService.login()
      } else {
        return $location.path('/login');
      }
    };




    $stateProvider
    .state('login', {
      url: "/login",
      templateUrl: 'views/login.html'
    })
    .state('chat', {
      url: "/conversations",
      templateUrl: 'views/chat.html',
      resolve: { 
            currentUser: function(currentUser){ return currentUser.fetch() },
            requireAuthentication: requireAuthentication,
            friends: function(Friends, requireAuthentication){ return Friends.all() }
          }
    })
    .state('chat.conversation', {
      url: "/:type/:name",
      template: '<conversation></conversation>',
      resolve: {

      }
    })
    .state('logout',{
        url: '/logout', 
        template: null,
        controller: function(AuthenticationService, $location, ngNotify, $window, $state){          
              
            AuthenticationService.logout().catch(function(error) {
              // The logging out process failed on the server side
              if(error.status == 500){
                ngNotify.set('Logout failed.', { type: 'error' }); 
              }    
            }).finally(function(){

              // refresh the all state of the application
              $location.path('/login');
              $window.location.reload()

            });
            
        }
      })
       $urlRouterProvider.when('/', '/conversations/channel/general');
      // For any unmatched url, redirect to /login
      $urlRouterProvider.otherwise("/login");

   




    //  .when('/conversation/:type/:name', {
    //    templateUrl: 'views/chat.html',
    //    reloadOnSearch: false,
    //    resolve: { 
    //                requireAuthentication: requireAuthentication
    //              },
    // 
    //  })


  })