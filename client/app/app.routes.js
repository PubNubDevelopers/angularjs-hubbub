angular
  .module('app')  
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/chat.html'
      })
      .otherwise({
        redirectTo: '/'
      });
  })