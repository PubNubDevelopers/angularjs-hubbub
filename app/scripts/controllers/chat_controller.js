'use strict';

angular.module('app')
.controller('ChatCtrl', ['$scope', 'MessageService', function($scope, MessageService) {

    $scope.messages = MessageService.getMessages();
  
}]);