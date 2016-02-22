angular.module('app').directive('messageList', function($timeout) {
  return {
    restrict: "E",
    replace: true,
    templateUrl: '/templates/directives/message-list.html',
    scope: {
      messages: "=",
    },
    link: function(scope, element, attrs, ctrl) {

      var scrollToBottom = function() {
          list = angular.element(element)[0]
          list.scrollTop = list.scrollHeight;
        };
      $timeout(scrollToBottom, 5);
      
    }
  };
});