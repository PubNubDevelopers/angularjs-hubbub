angular.module('app')
.factory('AuthenticationService', ['$rootScope','Pubnub','ngNotify', '$auth','currentUser', '$cacheFactory', '$http', 'config', '$location',
 function AuthenticationService($rootScope,Pubnub, ngNotify, $auth, currentUser, $cacheFactory, $http, config, $location) {
  
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

		$auth.logout()

		//---------------------------------------------------------
  	var channels = [	
									'messages', 
									currentUser.get().id.toString() + '_presence'
							 ]

		var channel_groups = [ 
    												currentUser.get().id.toString() + '_friends_presence'													
    										 ]

		Pubnub.unsubscribe({ channel: channels });
		Pubnub.unsubscribe({ channel_group: channel_groups });

  	$cacheFactory.get('$http').removeAll();

	};

	///////////////////////////////////////////////////

  var login = function(){

  	ngNotify.dismiss();

  	return currentUser.fetch().then(function(){

  		Pubnub.set_uuid(currentUser.get().id) 
    	Pubnub.auth($auth.getToken())

    	var channels = [	
    									  'messages', 
    									  // Automatically publish presence events on the own user presence channel
    										currentUser.get().id.toString() + '_presence'  
    								 ]

	    Pubnub.subscribe({
	          channel: channels,
	          disconnect : whenDisconnected, 
	          reconnect : whenReconnected,
	          error: whenError,
	          noheresync: true, 
	          triggerEvents: true
	    });

	    var channel_groups = [ 
    						    currentUser.get().id.toString() + '_friends_presence-pnpres'													
    						 ]

	    Pubnub.subscribe({
	          channel_group: channel_groups,
	          noheresync: true,
	          triggerEvents: ['callback']
	    });    	

	  });
  };

  var logout = function(){

  		return serverSignout().finally(function(){

  			clientSignout();

  		});			

  };


  return {
    login: login,
    logout: logout
  };

}]);