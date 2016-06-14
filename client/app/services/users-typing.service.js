angular.module('app')
.factory('UsersTyping', ['$rootScope', 'Pubnub', 'currentUser', '$pubnubChannelGroup',
 function UsersTyping($rootScope, Pubnub, currentUser,$pubnubChannelGroup) {
    
    var channelGroup = 'conversations_' + currentUser.get().id.toString()+'-pnpres';



    var options = {

      channelExtension:  {

        $$store: function(event) {
          
        // We don't want to receive our own presence events
        if(event['uuid'].toString() === currentUser.get().id.toString()) return;

        // Add people typing
        if(event['action'] === 'state-change' && event['data']['isTyping']){

            // Check if not already in the array
            if(!_.find(this.$messages, { uuid: event['uuid']}))
              this.$messages.push({uuid: event['uuid']});

        }
        // Remove people typing
        else if(  ( event['action'] === 'state-change' && event['data']['isTyping'] === false ) || 
                    event['action'] === 'timeout'                                               || 
                    event['action'] === 'leave' ){

            _.remove(this.$messages, function(user) {
              return user['uuid'] === event['uuid'];
            });
        }

        }
      }
    }

    return $pubnubChannelGroup(channelGroup,options);
}
]);