angular.module('app').directive('typeTracking', function(TypingIndicator, $timeout, $stateParams) {
  return {

    restrict: 'A',
    scope: false,

    link: function(scope, element, attrs) {
      
      scope.$watch(attrs['ngModel'], function (input) {

        // When to start Typing ?
        // Content is not empty and was not typing before
        if( !_.isEmpty(input) && !scope.isCurrentlyTyping ){
          TypingIndicator.startTyping(scope.conversationChannel);
          scope.isCurrentlyTyping = true;
          scope.stopTypingScheduler();
        }
        // When to reschedule ?
        // when the input is not empty and you are typing
        else if ( !_.isEmpty(input) && scope.isCurrentlyTyping ){
          scope.stopTypingScheduler();
          scope.isCurrentlyTyping = true;
        }
        // When to stop typing ?
        // You erase the input : You were typing and the input is now empty
        else if ( scope.isCurrentlyTyping && _.isEmpty(input) ){
          // Stop typing immediatly
          scope.stopTypingScheduler.flush();
          scope.isCurrentlyTyping = false;
        }
      });
    },
    
    controller: function($scope){

      $scope.conversationChannel = $scope.conversation.$channel()
      // Time before the stop typing event is fired after stopping to type.
      $scope.stopTypingTime = 5000

      // Keep track of the last action
      // This boolean is useful in order to know if we should send a stopTyping event in case the user was previously typing.
      $scope.isCurrentlyTyping = false;
      
      // Scheduler that trigger stopTyping if the function has not been invoced after stopTypingTime
      $scope.stopTypingScheduler = _.debounce(function(){ TypingIndicator.stopTyping($scope.conversationChannel)}, $scope.stopTypingTime)

    }
  };
});