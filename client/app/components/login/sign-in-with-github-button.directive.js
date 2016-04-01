angular.module('app').directive('signInWithGithubButton', function() {
  return {
    restrict: "E",
    templateUrl: 'components/login/sign-in-with-github-button.html',

    controller: function($scope, $auth, $location, ngNotify){

      $scope.authenticate = function(provider) {
      	
      		$auth.authenticate(provider)
		    	.then(function(response) {
		    		$location.path('/'); 
		  		})
		  		.catch(function(response) {
		    	
		    	 ngNotify.set('Authentification failed.', { type: 'error' });
		  		});

		  };
    }
  };
});