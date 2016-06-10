angular.module('app').directive('typingIndicatorBox', function($rootScope, TypingIndicator) {
  return {
    restrict: "E",
    replace: true,
    templateUrl: 'components/typing-indicator-box/typing-indicator-box.html',
    scope: {
      usersTyping: "="
    }
  };
});