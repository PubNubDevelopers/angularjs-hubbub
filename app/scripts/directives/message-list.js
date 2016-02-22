angular.module('app').directive('messageList', function($timeout,MessageService) {
  return {
    restrict: "E",
    replace: true,
    templateUrl: '/templates/directives/message-list.html',
    scope: {
      messages: "=",
    },
    link: function(scope, element, attrs, ctrl) {

      var scrollToBottom = function() {
          var list = angular.element(element)[0]
          list.scrollTop = list.scrollHeight;
        };

      var scrollReachedBottom = function(){
        element = angular.element(element)
        return $(element).scrollTop() + $(element).innerHeight() >= $(element)[0].scrollHeight
      }

      var scrollReachedTop = function(){
        element = angular.element(element)
        return $(element).scrollTop() === 0 ;
      }

      var updateScrollStatus = function() {

        var previousValue = scope.autoScrollDown;
        var newValue = scrollReachedBottom();
        if(scrollReachedTop()){
          MessageService.fetchPreviousMessages();
        }

        // Update the autoScrollDown value if it has changed
        if (newValue != previousValue){
          scope.autoScrollDown = newValue ;
          scope.$digest();
        }
      };

      // Scroll down when the list is rendered
      $timeout(scrollToBottom, 400);

      // Check where the scroll is on the list
       angular.element(element).bind("scroll", updateScrollStatus);

      // Scroll down when new message
      MessageService.subscribeNewMessage(function(){
        if(scope.autoScrollDown){
          scrollToBottom()
        }
      });

    },
    controller: function($scope){
      // Auto scroll down is acticated when first loaded
      $scope.autoScrollDown = true;
    }
  };
});