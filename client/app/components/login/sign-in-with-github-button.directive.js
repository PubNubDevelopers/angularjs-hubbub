angular.module('app').directive('signInWithGithubButton', function() {
  return {
    restrict: "E",
    templateUrl: 'components/login/sign-in-with-github-button.html',

    controller: function($scope, $auth, $location, ngNotify){

      $scope.authenticate = function() {
      	
      		$auth.authenticate('github')
		    	.then(function(response) {
		    		$location.path('/'); 
		  		})
		  		.catch(function(response) {
		    	
		    	 ngNotify.set('Authentication failed.', {
              type: 'error',
              sticky: true,
              button: true,
            });
		  		});

		  };
    }
  };
});