angular.module('app').directive('typingIndicatorBox', function($rootScope, TypingIndicatorService) {
  return {
    restrict: "E",
    replace: true,
    templateUrl: 'components/typing-indicator-box/typing-indicator-box.html',

    controller: function($scope){
      
      $scope.usersTyping = TypingIndicatorService.getUsersTyping();

    }
  };
});