angular.module('app')
.factory('TypingIndicatorService', ['$rootScope', 'Pubnub','currentUser', '$filter',
 function TypingIndicatorServiceFactory($rootScope, Pubnub, currentUser, $filter) {
  
  // Aliasing this by self so we can access to this trough self in the inner functions
  var self = this;
  // List of uuids that are typing
  this.usersTyping = []
  this.channel = 'messages-channel-blog4';
  
  // Typing indicator of the current user
  this.isCurrentUserTyping = false ;

  var init = function(){
    
    $rootScope.$on(Pubnub.getPresenceEventNameFor(self.channel), function (ngEvent, presenceEvent) {
      updateTypingUserList(presenceEvent);
    });

  }

  var updateTypingUserList = function(event){

      // We don't want to receive our own presence events
      if(event['uuid'] === currentUser) return;

      // Add people typing
      if(event['action'] === 'state-change' && event['data']['isTyping']){

          // Check if not already in the array
          if(!_.find(self.usersTyping, { uuid: event['uuid']}))
            self.usersTyping.push({uuid: event['uuid']});

      }
      // Remove people typing
      else if(  ( event['action'] === 'state-change' && event['data']['isTyping'] === false ) || 
                  event['action'] === 'timeout'                                               || 
                  event['action'] === 'leave' ){

          _.remove(self.usersTyping, function(user) {
            return user['uuid'] === event['uuid'];
          });
      }

      $rootScope.$digest();
  };


  var getUsersTyping = function(uuid){
    return self.usersTyping;
  };

  var isCurrentUserTyping = function(){
    return self.isCurrentUserTyping;
  }


  var setTypingState = _.debounce(function(isTyping){

        self.isCurrentUserTyping = isTyping;
        Pubnub.state({
          channel: self.channel,
          uuid: currentUser,
          state: { isTyping: self.isCurrentUserTyping }
        });

  },400);


  var startTyping = function(){

    setTypingState(true)

  };


  var stopTyping = function(){

    setTypingState(false)

  };

  init();

  return {
    getUsersTyping: getUsersTyping,
    startTyping: startTyping,
    stopTyping: stopTyping,
    isCurrentUserTyping: isCurrentUserTyping
  } 

}]);
