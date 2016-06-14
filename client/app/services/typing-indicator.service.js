angular.module('app')
.factory('TypingIndicator', ['$rootScope', 'Pubnub','currentUser', '$filter',
 function TypingIndicator($rootScope, Pubnub, currentUser, $filter) {
  
  // Aliasing this by self so we can access to this trough self in the inner functions
  var self = this;

  // Name of the channel the current user is typing in
  // Null if he is not typing

  this.channelUserIsTyping = false ;


  var channelUserIsTyping = function(){
    return self.channelUserIsTyping;
  };

  // Indicates if the user is currently typing in this channel
  var isCurrentUserTyping = function(channel){
    return self.channelUserIsTyping == channel
  };

  var setTypingState = _.debounce(function(channel, isTyping){

        Pubnub.state({
          channel: channel,
          uuid: currentUser.get().id,
          state: { isTyping: isTyping }
        });

  },400);


  var startTyping = function(channel){

    setTypingState(self.channelUserIsTyping,false)
    if(self.channelUserIsTyping){
      
      self.channelUserIsTyping = null;
    }

    setTypingState(channel,true)

  };


  var stopTyping = function(channel){

    setTypingState(self.channelUserIsTyping,false)
    if(self.channelUserIsTyping){
      self.channelUserIsTyping = null;
    }

    setTypingState(channel,false)

  };

  return {
    startTyping: startTyping,
    stopTyping: stopTyping,
    channelUserIsTyping: channelUserIsTyping,
  } 

}]);