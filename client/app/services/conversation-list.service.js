// This service return the list of the conversation of the user. (Does not include the one-to-one conversations).
angular.module('app')
.factory('ConversationList', ['$http', 'config', function conversationListFactory($http, config) {
  
  this.conversations = []
  var self = this

  var all = function(){
    return $http({method: 'GET', cache: true,  url: config.SERVER_URL+"api/conversations/"})
            .then(function(conversations){

                self.conversations = conversations.data
                return self.conversations
            
            })

  };

  var find = function(findObject){
    
    return _.find(self.conversations, findObject);

  }

  return { 
    all: all,
    find: find
  }

}]);