'use strict';

angular.module('app')
.controller('ChatCtrl', ['$scope', 'Pubnub','currentUser', function($scope, Pubnub, currentUser) {

    $scope.messages = [];
    $scope.channel = 'messages-channel';

    $scope.messageContent = '';
    
    $scope.uuid = currentUser.getUuid();

    // Fetching the messages history
    // Don't forget to activate the history in your PubNub app in the developer portal.
    Pubnub.history({
     channel: $scope.channel,
     callback: function(m){ 
      $scope.$apply(function () { 
        $scope.messages = m[0] ; 
      });
      $scope.scrollDown(0);
     },
     count: 50,
     reverse: false
    });

  
    // Fetching a uniq random avatar from the robohash.org service.
    $scope.avatarUrl = function(uuid) {
        return 'http://robohash.org/' + uuid + '?set=set2&bgset=bg2&size=70x70';
    };

    $scope.sendMessage = function() {
        // Don't send an empty message 
        if (!$scope.messageContent || $scope.messageContent === '') {
            return;
        }
        Pubnub.publish({
            channel: $scope.channel,
            message: {
                content: $scope.messageContent,
                sender_uuid: $scope.uuid,
                date: new Date()
            },
            callback: function(m) {
                console.log(m);
            }
        });
        // Reset the messageContent input
        $scope.messageContent = '';

    }

    Pubnub.subscribe({
        channel: $scope.channel,
        triggerEvents: ['callback']
    });
  
    // Make it possible to scrollDown to the bottom of the messages container
    $scope.scrollDown = function(time) {
        var $elem = $('.collection');
        $('body').animate({
            scrollTop: $elem.height()
        }, time);
    };
  
    // Listenning to messages sent.
    $scope.$on(Pubnub.getMessageEventNameFor($scope.channel), function(ngEvent, m) {
        $scope.$apply(function() {
            $scope.messages.push(m)
            $scope.scrollDown(400);
        });
    });
}]);