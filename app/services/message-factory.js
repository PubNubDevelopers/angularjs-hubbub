angular.module('app')
.factory('MessageService', ['$rootScope', '$pubnubChannel','currentUser',
 function MessageServiceFactory($rootScope,  $pubnubChannel, currentUser) {
 
    // We create an extended $pubnubChannel channel object that add a additionnal sendScore method
    // that publish a score with the name of the player preloaded.
    var Channel = $pubnubChannel.$extend({
      sendMessage: function(messageContent) {
         return this.$publish({
                                  uuid: (Date.now() + currentUser),
                                  content: messageContent,
                                  sender_uuid: currentUser,
                                  date: Date.now()
                              })
         }
    });

   return Channel('messages-channel-blog4', {autoload: 20, presence: true});

}]);