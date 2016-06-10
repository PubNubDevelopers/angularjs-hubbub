angular.module('app').directive('channels', function() {
  return {
    restrict: "E",
    templateUrl: 'components/channels/channels.html',
    controller: function($scope, ConversationList){

    	ConversationList.all().then(function(conversations){
    		$scope.channels = conversations
    	})

   	}
  };
});