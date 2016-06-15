angular.module('app')
.factory('AuthenticationService', ['$rootScope','Pubnub','ngNotify', '$auth','currentUser', '$cacheFactory', '$http', 'config', '$location', 'NotificationService',
 function AuthenticationService($rootScope,Pubnub, ngNotify, $auth, currentUser, $cacheFactory, $http, config, $location, NotificationService) {
  
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

	var serverSignout = function(){
		 
		 var url = config.SERVER_URL + 'logout'
		 return $http({ method: 'POST', url: url })

	};


	var clientSignout = function(){

  		var channels = [	
								'user_presence_' + currentUser.get().id.toString()
						]

		var channel_groups = [ 
    								'friends_presence_' + currentUser.get().id.toString() +'-pnpres',
    								'conversations_' + currentUser.get().id.toString()										
    						 ]

		Pubnub.unsubscribe({ channel: channels });
		Pubnub.unsubscribe({ channel_group: channel_groups });

	};

	///////////////////////////////////////////////////

  var login = function(){

  	// Disable for now
  	//ngNotify.dismiss();

  	return currentUser.fetch().then(function(){

  		Pubnub.set_uuid(currentUser.get().id) 
    	Pubnub.auth($auth.getToken())

  		var channels = [	
								'user_presence_' + currentUser.get().id.toString() 
						]

		var channel_groups = [ 
    								'friends_presence_' + currentUser.get().id.toString() +'-pnpres'										
    						 ]

	    Pubnub.subscribe({
	          channel: channels,
	          disconnect : whenDisconnected, 
	          reconnect : whenReconnected,
	          error: whenError,
	          noheresync: true, 
	          triggerEvents: true
	    });

	    Pubnub.subscribe({
	          channel_group: channel_groups,
	          noheresync: true,
	          triggerEvents: ['callback']

	    });

	    NotificationService.init();

	    return true;

	  });
  };

  var logout = function(){

  		clientSignout();

  		return serverSignout().finally(function(){

  			$auth.logout()
  			$cacheFactory.get('$http').removeAll();

  		});			

  };


  return {
    login: login,
    logout: logout
  };

}]);