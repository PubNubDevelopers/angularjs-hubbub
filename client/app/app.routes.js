angular
  .module('app')  
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/chat.html'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
      })
      .otherwise({
        redirectTo: '/'
      });
  })