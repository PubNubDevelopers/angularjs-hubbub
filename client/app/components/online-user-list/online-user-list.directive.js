angular.module('app').directive('onlineUserList', function($rootScope, OnlineUsersService, ConversationList) {
  return {
    restrict: "E",
    replace: true,
    templateUrl: 'components/online-user-list/online-user-list.html',

    controller: function($scope){
      
      $scope.users = OnlineUsersService.getOnlineUsers();

      ConversationList.all().then(function(conversations){
    		$scope.currentConversationName = ConversationList.find({channel: $scope.conversationChannel}).name;
    		
    	})
    }
  };
});