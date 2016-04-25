angular.module('app').directive('friendsSearchBox', function() {
  return {
    restrict: "E",
    replace: true,
    templateUrl: 'components/friends-search-box/friends-search-box.html',
    scope: false
  };
});