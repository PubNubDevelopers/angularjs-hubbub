angular.module('app').directive('messageForm', function() {
  return {
    restrict: "E",
    templateUrl: '/templates/directives/message-form.html',
    scope: {},
    
    controller: function($scope, currentUser, MessageService){

      $scope.uuid = currentUser.getUuid();
      $scope.messageContent = '';

      $scope.sendMessage = function(){
      	MessageService.sendMessage($scope.messageContent);
      	$scope.messageContent = '';
      }
    }
  };
});