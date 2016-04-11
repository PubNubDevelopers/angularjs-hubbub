angular.module('app')
.factory('AuthenticationService', ['Pubnub','ngNotify', '$auth','currentUser', '$cacheFactory', '$http', 'config',
 function AuthenticationService(Pubnub, ngNotify, $auth, currentUser, $cacheFactory, $http, config) {
  
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

	var channel = "messages";


	var serverSignout = function(){
		 
		 var url = config.SERVER_URL + 'logout'
		 return $http({ method: 'POST', url: url })

	};

	///////////////////////////////////////////////////

  var login = function(){

  	return currentUser.fetch().then(function(){
  		
  		Pubnub.set_uuid(currentUser.get().id) 
    	Pubnub.auth($auth.getToken())

	    Pubnub.subscribe({
	          channel: channel,
	          disconnect : whenDisconnected, 
	          reconnect : whenReconnected,
	          noheresync: true, 
	          triggerEvents: true
	    });

	  });
  };

  var logout = function(){

  		return serverSignout().then(function(){

  			$auth.logout();

  		}).then(function(){

  			Pubnub.unsubscribe({ channel: channel });
  			$cacheFactory.get('$http').removeAll();

  		});  			

  };

  return {
    login: login,
    logout: logout
  };

}]);