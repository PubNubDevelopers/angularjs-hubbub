angular.module('app')
.factory('Friends', ['$http','config', function FriendsFactory($http, config) {
  return {
    all: function() {
      return $http({method: 'GET', url: config.SERVER_URL+"api/friends"});
    }
  };
}]);