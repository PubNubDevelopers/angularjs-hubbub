angular.module('app').directive('conversation', function($rootScope) {
  return {
    restrict: "E",
    replace: true,
    templateUrl: 'components/conversation/conversation.html',
    scope: true, 
    controller: function($scope, $state, Friends, Conversations, $stateParams, Pubnub, TypingIndicator, UsersTyping){

      $scope.conversationType = $stateParams.type
      $scope.conversation = null;
      $scope.friend = null;
      $scope.conversationChannel = null;


      if ($stateParams.type == 'channel'){

        $scope.conversationChannel = 'conversation_channel_'+ $stateParams.name
        $scope.conversation = Conversations.$channel($scope.conversationChannel);
        $scope.conversationChannel =  'conversation_channel_'+ $stateParams.name

      }
      else{

        $scope.friend = Friends.find({login: $stateParams.name});
        $scope.conversationChannel = $scope.friend.direct_conversation_channel;
        $scope.conversation = Conversations.$channel($scope.conversationChannel);

      }

      $scope.usersTyping = UsersTyping.$channel($scope.conversationChannel+'-pnpres');

      
      if (_.isEmpty($scope.conversation)){
           $scope.conversation.$load(10)
         }

    } 
  };
});