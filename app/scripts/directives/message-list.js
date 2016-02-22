angular.module('app').directive('messageList', function($timeout) {
  return {
    restrict: "E",
    replace: true,
    templateUrl: '/templates/directives/message-list.html',
    scope: {
      messages: "=",
    }
  };
});