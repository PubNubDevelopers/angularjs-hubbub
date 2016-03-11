angular.module('app')
.factory('UserService', ['$rootScope', 'Pubnub','currentUser',
 function UserServiceFactory($rootScope, Pubnub, currentUser) {
  
  // Aliasing this by self so we can access to this trough self in the inner functions
  var self = this;
  this.users = []
  this.channel = 'messages-channel-blog3';

  var populate = function(){
    
    Pubnub.here_now({
      channel : self.channel,
      state: true,
      callback : function(m){
        angular.extend(self.users, m['uuids']); 
        $rootScope.$digest()
      }
    });

  };

  var updateOnlineUserList = function(event){
      
      // We don't want to receive our own presence events
      if(event['uuid'] === currentUser) return;

      if(event['action'] === 'join'){

        // We check if the user is not already online
        if(!_.find(self.users, { uuid: event['uuid']}))
          self.users.push({uuid: event['uuid']})
    
      }
      else if( event['action'] === 'timeout' || event['action'] === 'leave' ){

        _.remove(self.users, function(user) {
          return user['uuid'] === event['uuid'];
        });

      }

      $rootScope.$digest();
  };

  var init = function() {
    
    populate();

    // We listen to Presence events :
    $rootScope.$on(Pubnub.getPresenceEventNameFor(self.channel), function (ngEvent, presenceEvent) {
      updateOnlineUserList(presenceEvent);
    });

  };

  var getOnlineUsers = function(){
    return self.users;
  };  

  init();

  return {
    getOnlineUsers: getOnlineUsers, 
  } 

}]);