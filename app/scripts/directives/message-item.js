angular.module('app').directive('messageItem', function(MessageService) {
  return {
    restrict: "E",
    templateUrl: '/templates/directives/message-item.html',
    scope: {
      senderUuid: "@",
      content: "@",
      date: "@"
    },
    link: function(scope, element, attrs, ctrl) {
      
    }

  };
});