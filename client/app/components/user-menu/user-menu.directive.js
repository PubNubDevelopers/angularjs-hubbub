angular.module('app').directive('userMenu', function() {
  return {
    restrict: "E",
    replace: true,
    templateUrl: 'components/user-menu/user-menu.html',
    scope: {}, 

    link: function(scope, element, attrs) {

      $('.dropdown-button').dropdown({
        inDuration: 300,
        outDuration: 225,
        constrain_width: false, // Does not change width of dropdown to that of the activator
        hover: false, // Activate on hover
        gutter: 10, // Spacing from edge
        belowOrigin: true, // Displays dropdown below the button
        alignment: 'left' // Displays dropdown with edge aligned to the left of button
      });
      
    },

    controller: function($scope, currentUser){

            $scope.currentUser = currentUser.get();
    }
  };
});