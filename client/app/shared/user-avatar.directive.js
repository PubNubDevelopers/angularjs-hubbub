angular.module('app').directive('userAvatar', function() {
  return {
    restrict: "E",
    template: '<img ng-src="{{avatarUrl}}" alt="{{uuid}}" class="circle">',
    scope: {
      uuid: "@",
    },
    replace: true,
    controller: function($scope){
      // Generating a uniq avatar for the given uniq string provided using robohash.org service
      $scope.avatarUrl = '//avatars.githubusercontent.com/u/' + $scope.uuid ;
    }
  };
});