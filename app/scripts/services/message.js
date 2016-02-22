angular.module('app')
.factory('MessageService', ['$rootScope','Pubnub','currentUser', function MessageServiceFactory($rootScope,Pubnub, currentUser) {
  
  var self = this;
  this.messages = []
  this.channel = 'messages-channel';

  ////// NOTIFICATION FUNCTIONS
  var subcribeNewMessage = function(callback){
    $rootScope.$on(Pubnub.getMessageEventNameFor(self.channel), callback);
  };

  var init = function() {
      Pubnub.subscribe({
          channel: self.channel,
          triggerEvents: ['callback']
      });
  }

  subcribeNewMessage(function(ngEvent,m){
    self.messages.push(m)
    $rootScope.$digest()
  });

  var fetchMessages = function() {
    // Fetching the messages history
    // Don't forget to activate the history in your PubNub app in the developer portal.
    Pubnub.history({
     channel: self.channel,
     callback: function(m){ 
        angular.extend(self.messages, m[0]);
        $rootScope.$digest()
     },
     count: 50,
     reverse: false
    });
  }

  init();

  ////////////////// PUBLIC API ////////////////////////

  var getMessages = function() {
    if (self.messages === undefined || self.messages.length == 0) {
      fetchMessages();
    }
    return self.messages;
  }

  var sendMessage = function(messageContent) {

        // Don't send an empty message 
        if (!messageContent || messageContent === '') {
            return;
        }

        Pubnub.publish({
            channel: self.channel,
            message: {
                content: messageContent,
                sender_uuid: currentUser.getUuid(),
                date: new Date()
            },
            callback: function(m) {
                console.log(m);
            }
        });
  }


  // The public API interface
  return {
    getMessages: getMessages, 
    sendMessage: sendMessage,
    subscribeNewMessage: subcribeNewMessage
  } 

}]);
