angular.module('app')
.factory('MessageService', ['$rootScope', '$q', 'Pubnub','currentUser', function MessageServiceFactory($rootScope, $q, Pubnub, currentUser) {
  
  var self = this;
  this.messages = []
  this.channel = 'messages-channel4';

  // Represent the timetoken of the first message for knowing 
  // which data has already been saved
  this.firstMessageTimeToken = null;

  ////// NOTIFICATION FUNCTIONS
  var subcribeNewMessage = function(callback){
    $rootScope.$on(Pubnub.getMessageEventNameFor(self.channel), callback);
  };

  var init = function() {
      Pubnub.subscribe({
          channel: self.channel,
          triggerEvents: ['callback']
      });
      Pubnub.time(function(time){
        this.firstMessageTimeToken = time;
      })

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
        // Update timetoken of the first message
        self.timeTokenFirstMessage = m[1]
        angular.extend(self.messages, m[0]);
        $rootScope.$digest()
     },
     count: 20,
     reverse: false
    });
  }

  var fetchPreviousMessages = function(){

    deferred = $q.defer()

    Pubnub.history({
     channel: self.channel,
     callback: function(m){ 
        // Update timetoken of the first message
        self.timeTokenFirstMessage = m[1]
        Array.prototype.unshift.apply(self.messages,m[0])
        $rootScope.$digest()
        deferred.resolve(m)
     },
     error: function(m){
        deferred.reject(m)
     },
     count: 10,
     start: self.timeTokenFirstMessage,
     reverse: false
    });

    return deferred.promise
  };

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
                uuid: (Date.now() + currentUser),
                content: messageContent,
                sender_uuid: currentUser,
                date: Date.now()
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
    subscribeNewMessage: subcribeNewMessage,
    fetchPreviousMessages: fetchPreviousMessages
  } 

}]);
