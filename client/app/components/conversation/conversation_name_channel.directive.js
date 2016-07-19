angular.module('app').directive('conversationNameChannel', function($rootScope,ConversationList) {
  return {
    restrict: "E",
    replace: true,
    templateUrl: 'components/conversation/conversation_name_channel.html',

    controller: function($scope){

      ConversationList.all().then(function(conversations){
    		$scope.currentConversationName = ConversationList.find({channel: $scope.conversationChannel}).name;
    		
    	});
      }
	}
 
});