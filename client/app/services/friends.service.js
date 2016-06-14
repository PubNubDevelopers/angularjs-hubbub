angular.module('app')
.factory('Friends', ['$rootScope', 'Pubnub','currentUser', '$http', '$q', 'config',
 function FriendsService($rootScope, Pubnub, currentUser, $http, $q, config) {
  
  // Aliasing this by self so we can access to this trough self in the inner functions
  var self = this;
  this.friends = []
  this.channel_group = 'friends_presence_' + currentUser.get().id.toString() 

/*
 |--------------------------------------------------------------------------
 | Fetch the friends list from the server
 |--------------------------------------------------------------------------
*/

  var fetchFriends = function(){
    return $http({method: 'GET', cache: true, url: config.SERVER_URL+"api/friends/"})
  }

/*
 |--------------------------------------------------------------------------
 | Fetch who of the user friends are online now
 |--------------------------------------------------------------------------
*/

  var fetchOnlineFriends = function(){

    var deferred = $q.defer()

    Pubnub.here_now({
      channel_group : self.channel_group,
      state: true,
      callback : function(m){

        var online_users = _.map(m['channels'], function(ch){
          return ch['uuids'][0]['uuid'];
        })

        // Remove the current user fron the list of online users
        _.remove(online_users, function(user) {
          return user['uuid'] == currentUser.get().id;
        });

        deferred.resolve(online_users)

      },
      error: function(err){ deferred.reject(err) }

    });

    return deferred.promise

  }

/*
 |--------------------------------------------------------------------------
 | Merge the online status to the friend list
 |--------------------------------------------------------------------------
*/

var mergeOnlineStatusToFriendList = function(friends, onlineFriends){

  // Key that is used to merge the online status
  var userIdKey = 'id';

  return friends = _.map(friends, function(friend){
    friend['online'] = _.includes(onlineFriends, _.toString(friend[userIdKey]))
    return friend;
  })

}

/*
 |--------------------------------------------------------------------------
 | Store the friend list in our Friends Service
 |--------------------------------------------------------------------------
*/

  var storeFriendList = function(friends){
    angular.extend(self.friends, friends); 
  }

/*
 |--------------------------------------------------------------------------
 | Subscribe to new friends presence events
 |--------------------------------------------------------------------------
*/

  var subscribeToFriendsPresenceEvents = function() {
    // We listen to Presence events :
    $rootScope.$on(Pubnub.getMessageEventNameFor(self.channel_group+'-pnpres'), function (ngEvent, presenceEvent) {
      updateOnlineFriendList(presenceEvent);
    });

  };

/*
 |--------------------------------------------------------------------------
 | Update the list of friend according to presence events
 |--------------------------------------------------------------------------
*/

  var updateOnlineFriendList = function(event){

    var online = (event['action'] === 'join');

    var index = _.findIndex(self.friends, { id: _.toNumber(event['uuid'])});

    // Only change the status if necessary
    if (index != -1 && online != self.friends[index]['online']){

      self.friends[index]['online'] = online;
      $rootScope.$digest();

    }
};


/*
 |--------------------------------------------------------------------------
 | Update the list of friend according to presence events
 |--------------------------------------------------------------------------
*/

  var all = function(){

    // We return the the array reference if already populated

    if (!(_.isEmpty(self.friends))){
      var deferred = $q.defer()
      deferred.resolve(self.friends);
      return deferred.promise;

    }

    return $q.all([fetchFriends(), fetchOnlineFriends()]).then(function(data){

      var friends = data[0].data;
      var onlineFriends = data[1];

      return mergeOnlineStatusToFriendList(friends, onlineFriends);


    }).then(function(friends){

        storeFriendList(friends)

        subscribeToFriendsPresenceEvents();

        return self.friends
    
    })

  }


/*
|--------------------------------------------------------------------------
| Find and return a friend based on a object {key: value}
|--------------------------------------------------------------------------
*/

var find = function(findObject){

  return _.find(self.friends, findObject);

}

/*
 |--------------------------------------------------------------------------
 | Public API
 |--------------------------------------------------------------------------
*/

  return { 
    all: all,
    find: find
  } 

}]);