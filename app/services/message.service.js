angular.module('app')
.factory('MessageService', ['$rootScope', '$q', 'Pubnub','currentUser', 'ngNotify',
 function MessageServiceFactory($rootScope, $q, Pubnub, currentUser, ngNotify) {
  
  // Aliasing this by self so we can access to this trough self in the inner functions
  var self = this;
  this.messages = []
  this.channel = 'messages-channel4';

  // We keep track of the timetoken of the first message of the array
  // so it will be easier to fetch the previous messages later
  this.firstMessageTimeToken = null;

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
        self.firstMessageTimeToken = time;
      })

  };

  subcribeNewMessage(function(ngEvent,m){
    self.messages.push(m)
    $rootScope.$digest()
  });


  var fetchPreviousMessages = function(){

    var deferred = $q.defer()

    // We load more messages the first time we load the app
    // And less when we fetch the messages the next times
    var default_messages_number = _.isEmpty(self.messages) ? 20 : 10 ;

    var whenFetchingHistory = function(m){ 
        // Update timetoken of the first message
        self.timeTokenFirstMessage = m[1]

        // We are updating the array in different way depending on if the message service has been populated or not
        if(_.isEmpty(self.messages)){
          angular.extend(self.messages, m[0]);  
          $rootScope.$emit('factory:message:populated')
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

    if (_.isEmpty(self.messages)){
      fetchPreviousMessages();
    }
    return self.messages;

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
    getMessages: getMessages, 
    sendMessage: sendMessage,
    subscribeNewMessage: subcribeNewMessage,
    fetchPreviousMessages: fetchPreviousMessages
  } 

}]);
