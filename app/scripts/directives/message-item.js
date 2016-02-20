angular.module('app').directive('messageItem', function() {
  return {
    restrict: "E",
    templateUrl: '/templates/directives/message-item.html',
    scope: {
      senderUuid: "@",
      content: "@",
      date: "@"
    }
  };
});