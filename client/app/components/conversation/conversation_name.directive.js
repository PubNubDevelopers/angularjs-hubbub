angular.module('app').directive('conversationName', function($rootScope) {
  return {
    restrict: "E",
    replace: true,
    templateUrl: 'components/conversation/conversation_name.html',
    scope: {
      user: "=",
    }
  };
});