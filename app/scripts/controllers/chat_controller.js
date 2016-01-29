'use strict';

angular.module('app')
.controller('ChatCtrl', ['$scope', 'Pubnub', function($scope, Pubnub) {
    $scope.messages = [];
    $scope.channel = 'messages-channel';

    $scope.messageContent = '';
    // Generating a random uuid between 1 and 100 using utility function from lodash library.
    $scope.uuid = _.random(1000000).toString();

    Pubnub.init({
        publish_key: 'pub-c-a1cd7ac1-585e-478e-925b-65d17ce62f7d',
        subscribe_key: 'sub-c-204f063e-c559-11e5-b764-02ee2ddab7fe',
        uuid: $scope.uuid
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