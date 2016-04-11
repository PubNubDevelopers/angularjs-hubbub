angular.module('app').directive('onlineUserList', function($rootScope, OnlineUsersService) {
  return {
    restrict: "E",
    replace: true,
    templateUrl: 'components/online-user-list/online-user-list.html',

    link: function(scope, element, attrs) {

    	$('.dropdown-button').dropdown({
	      inDuration: 300,
	      outDuration: 225,
	      constrain_width: false, // Does not change width of dropdown to that of the activator
	      hover: true, // Activate on hover
	      gutter: 0, // Spacing from edge
	      belowOrigin: true, // Displays dropdown below the button
	      alignment: 'left' // Displays dropdown with edge aligned to the left of button
	    });
	    
   	},
    controller: function($scope, currentUser){
      
      $scope.users = OnlineUsersService.getOnlineUsers();
      $scope.currentUser = currentUser.get();
    }
  };
});