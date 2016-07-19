angular.module('app').directive('conversationNameDirect', function($rootScope) {
  return {
    restrict: "E",
    replace: true,
    templateUrl: 'components/conversation/conversation_name_direct.html',
    scope: {
      user: "="
    }
  };
});