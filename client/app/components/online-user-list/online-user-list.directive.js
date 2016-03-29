angular.module('app').directive('onlineUserList', function($rootScope, UserService) {
  return {
    restrict: "E",
    replace: true,
    templateUrl: 'components/online-user-list/online-user-list.html',

    controller: function($scope){
      
      $scope.users = UserService.getOnlineUsers();

    }
  };
});