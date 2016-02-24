'use strict';

/**
 * @ngdoc overview
 * @name appApp
 * @description
 * # appApp
 *
 * Main module of the application.
 */
angular
  .module('app', [ 'ngRoute', 'pubnub.angular.service', 'ngNotify'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/chat.html',
        controller: 'ChatCtrl',
        controllerAs: 'chat'
      })
      .otherwise({
        redirectTo: '/'
      });
  })

  .run(['Pubnub','currentUser', function(Pubnub, currentUser) {

    Pubnub.init({
          publish_key: 'pub-c-a1cd7ac1-585e-478e-925b-65d17ce62f7d',
          subscribe_key: 'sub-c-204f063e-c559-11e5-b764-02ee2ddab7fe',
          uuid: currentUser
      });

  }])
  .run(['ngNotify', function(ngNotify) {

      ngNotify.config({
          theme: 'paster',
          position: 'top',
          duration: 200,
          type: 'success',
          sticky: false,
          button: false,
          html: false
      });

  }]);


