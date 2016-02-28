angular.module('app')
.factory('MessageService', ['$rootScope', '$q', 'Pubnub','currentUser', 'ngNotify',
 function MessageServiceFactory($rootScope, $q, Pubnub, currentUser, ngNotify) {
  
  var self = this;
  this.messages = []
  this.channel = 'messages-channel4';

  // We keep track of the timetoken of the first message of the array
  // so it will be easier to fetch the previous messages later
  this.firstMessageTimeToken = null;

  // Indicates wheither the messages service has been populated or not
  this.isPopulated = false;

  ////// NOTIFICATION FUNCTIONS
  var subcribeNewMessage = function(callback){
    $rootScope.$on(Pubnub.getMessageEventNameFor(self.channel), callback);
  };

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

  var init = function() {
      Pubnub.subscribe({
          channel: self.channel,
          disconnect : whenDisconnected, 
          reconnect : whenReconnected,
          triggerEvents: ['callback']
      });
      Pubnub.time(function(time){
        this.firstMessageTimeToken = time;
      })

  };

  subcribeNewMessage(function(ngEvent,m){
    self.messages.push(m)
    $rootScope.$digest()
  });


  var fetchPreviousMessages = function(){

    deferred = $q.defer()

    // We load more messages the first time we load the app
    // And less when we fetch the messages the next times
    var default_messages_number = self.isPopulated ? 10 : 20 ;

    var whenFetchingHistory = function(m){ 
        // Update timetoken of the first message
        self.timeTokenFirstMessage = m[1]

        // We are updating the array in different way depending on if the message service has been populated or not
        if(!self.isPopulated){
          // We merge the 
          angular.extend(self.messages, m[0]);  
          self.isPopulated = true;
        }
        else{
          Array.prototype.unshift.apply(self.messages,m[0])
        }

        $rootScope.$digest()
        deferred.resolve(m)
    };

    Pubnub.history({
     channel: self.channel,
     callback: whenFetchingHistory,
     error: function(m){
        deferred.reject(m)
     },
     count: default_messages_number, 
     start: self.timeTokenFirstMessage,
     reverse: false
    });

    return deferred.promise
  };

  init();

  ////////////////// PUBLIC API ////////////////////////

  var getMessages = function() {

    if (!self.isPopulated){
      fetchPreviousMessages();
    }
    return self.messages;

  };

  var isPopulated = function(){
    return self.isPopulated
  };

  var sendMessage = function(messageContent) {

        // Don't send an empty message 
        if (!messageContent || messageContent === '') {
            return;
        }

        Pubnub.publish({
            channel: self.channel,
            message: {
                uuid: (Date.now() + currentUser),
                content: messageContent,
                sender_uuid: currentUser,
                date: Date.now()
            },
            callback: function(m) {
                console.log(m);
            }
        });
  };


  // The public API interface
  return {
    isPopulated: isPopulated,
    getMessages: getMessages, 
    sendMessage: sendMessage,
    subscribeNewMessage: subcribeNewMessage,
    fetchPreviousMessages: fetchPreviousMessages
  } 

}]);
