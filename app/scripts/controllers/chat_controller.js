'use strict';

angular.module('app')
.controller('ChatCtrl', ['$scope', 'Pubnub','currentUser', 'MessageService', function($scope, Pubnub, currentUser, MessageService) {

    $scope.messages = MessageService.getMessages();

    $scope.messageContent = '';
    
    $scope.uuid = currentUser.getUuid();

  
    // Fetching a uniq random avatar from the robohash.org service.
    $scope.avatarUrl = function(uuid) {
        return 'http://robohash.org/' + uuid + '?set=set2&bgset=bg2&size=70x70';
    };
  
    // Make it possible to scrollDown to the bottom of the messages container
    $scope.scrollDown = function(time) {
        var $elem = $('.collection');
        $('body').animate({
            scrollTop: $elem.height()
        }, time);
    };

    $scope.sendMessage = function(){
      MessageService.sendMessage($scope.messageContent);
      $scope.messageContent = '';
    }
  
}]);