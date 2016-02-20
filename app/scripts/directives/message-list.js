angular.module('app').directive('messageList', function() {
  return {
    restrict: "E",
    templateUrl: '/templates/directives/message-list.html',
    scope: {
      messages: "=",
    }
  };
});