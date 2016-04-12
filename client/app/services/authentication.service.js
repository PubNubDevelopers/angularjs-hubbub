angular.module('app')
.factory('AuthenticationService', ['Pubnub','ngNotify', '$auth','currentUser', '$cacheFactory', '$http', 'config', '$location',
 function AuthenticationService(Pubnub, ngNotify, $auth, currentUser, $cacheFactory, $http, config, $location) {
  
	var whenDisconnected = function(){
	  ngNotify.set('Connection lost. Trying to reconnect...', {
	    type: 'warn',
	    sticky: true,
	    button: false,
	  });
	};

	var whenReconnected = function(){
	  ngNotify.set('Connection re-established.', {
	      type: 'info',
	      duration: 1500
	  });
	};

	var whenError = function(error){

		if(error.status == 403){

			ngNotify.set('You have been logged out.', {
		    type: 'warn',
		    sticky: true,
		    button: true,
	  	});

	  	clientSignout();
	  	$location.path('/login');

		}
	};

	var channel = "messages";


	var serverSignout = function(){
		 
		 var url = config.SERVER_URL + 'logout'
		 return $http({ method: 'POST', url: url })

	};


	var clientSignout = function(){

		$auth.logout()
		Pubnub.unsubscribe({ channel: channel });
  	$cacheFactory.get('$http').removeAll();


	};

	///////////////////////////////////////////////////

  var login = function(){

  	ngNotify.dismiss();

  	return currentUser.fetch().then(function(){
  			
  		Pubnub.set_uuid(currentUser.get().id) 
    	Pubnub.auth($auth.getToken())

	    Pubnub.subscribe({
	          channel: channel,
	          disconnect : whenDisconnected, 
	          reconnect : whenReconnected,
	          error: whenError,
	          noheresync: true, 
	          triggerEvents: true
	    });

	  });
  };

  var logout = function(){

  		return serverSignout().then(function(){

  			clientSignout();

  		});			

  };


  return {
    login: login,
    logout: logout
  };

}]);