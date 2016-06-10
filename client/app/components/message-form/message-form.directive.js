angular.module('app').directive('messageForm', function() {
  return {
    restrict: "E",
    replace: true,
    templateUrl: 'components/message-form/message-form.html',
    scope: {
      typingIndicator: "=",
      conversation: "="
    },
    
    controller: function($scope, currentUser){

      $scope.sendMessage = function(){

          if(_.isEmpty($scope.messageContent)){
              return;
          }

            $scope.conversation.sendMessage($scope.messageContent).then(function(){
                
              $scope.messageContent = '';

          })

      }

    }
  };
});