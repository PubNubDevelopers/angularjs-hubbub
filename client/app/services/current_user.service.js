angular.module('app')
.factory('currentUser', ['$http', '$auth', function currentUserFactory($http, $auth) {

	var userApiUrl = 'https://api.github.com/user';
	var token = $auth.getToken()
	var authenticatedUser = null

	var fetch = function(){
		return $http({ cache: true, method: 'GET', url: userApiUrl })
				 .then(function(user){
				 	authenticatedUser = user.data; 
				 	return user.data
				 })
	};

	var get = function(){
		return authenticatedUser;
	};

    return {
    			fetch: fetch,
    			get: get
    	} 
   
}]);