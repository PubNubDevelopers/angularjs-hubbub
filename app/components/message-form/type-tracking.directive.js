angular.module('app').directive('typeTracking', function(TypingIndicatorService, $timeout) {
  return {

    restrict: 'A',

    link: function(scope, element, attrs) {
      
      scope.$watch(attrs['ngModel'], function (input) {

        // When to start Typing ?
        // Content is not empty and was not typing before
        if( !_.isEmpty(input) && !TypingIndicatorService.isCurrentUserTyping() ){
          TypingIndicatorService.startTyping();
          scope.stopTypingScheduler();
        }
        // When to reschedule ?
        // when the input is not empty and you are typing
        else if ( !_.isEmpty(input) && TypingIndicatorService.isCurrentUserTyping() ){
          scope.stopTypingScheduler();
        }
        // When to stop typing ?
        // You erase the input : You were typing and the input is now empty
        else if ( TypingIndicatorService.isCurrentUserTyping() && _.isEmpty(input) ){
          // Stop typing immediatly
          scope.stopTypingScheduler.flush();
        }
      });
    },
    
    controller: function($scope){

      // Time before the stop typing event is fired after stopping to type.
      $scope.stopTypingTime = 5000
      
      // Scheduler that trigger stopTyping if the function has not been invoced after stopTypingTime
      $scope.stopTypingScheduler = _.debounce(TypingIndicatorService.stopTyping, $scope.stopTypingTime)

    }
  };
});