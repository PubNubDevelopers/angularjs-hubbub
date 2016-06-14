angular.module('app')
.factory('Conversations', ['$rootScope', 'currentUser', '$pubnubChannelGroup', 'Pubnub',
 function ConversationsService($rootScope, currentUser,$pubnubChannelGroup, Pubnub) {
    
    var channelGroup = 'conversations_' + currentUser.get().id.toString();

    return $pubnubChannelGroup(channelGroup,{
      channelExtension: {
        sendMessage: function(message){

          return this.$publish({
                              uuid: (Date.now() + currentUser.get().id.toString()),
                              content: message,
                              sender: { 
                                        uuid: currentUser.get().id.toString(),
                                        login: currentUser.get().login
                                      },
                              date: Date.now()
                            })        
        }
      }
    });
}
]);