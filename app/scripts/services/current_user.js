angular.module('app')
.factory('currentUser', ['User', function currentUserFactory(User) {

  // Generating a user with a random uuid between 1 and 100 using utility function from lodash library.
  return new User(_.random(1000000).toString()) ;

}]);
