angular.module('app').directive('conversation', function($rootScope) {
  return {
    restrict: "E",
    replace: true,
    templateUrl: 'components/conversation/conversation.html',
    scope: true, 
    controller: function($scope, $state, Friends, Conversations, $stateParams, Pubnub, TypingIndicator){


      $scope.conversation = null;
      $scope.friend = null;

      if ($stateParams.type == 'channel'){

        $scope.conversation = Conversations.$channel('conversation_channel_'+ $stateParams.name);

      }
      else{

        $scope.friend = Friends.find({login: $stateParams.name});
        $scope.conversation = Conversations.$channel($scope.friend.direct_conversation_channel);

      }

      
      if (_.isEmpty($scope.conversation)){
           $scope.conversation.$load(10)
         }

      //$scope.typingIndicator = new TypingIndicator($scope.channel)

    } 
  };
});