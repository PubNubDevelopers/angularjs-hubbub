angular.module('app').directive('messageList', function($timeout, $anchorScroll, MessageService, ngNotify) {
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

      var hasScrollReachedBottom = function(){
        element = angular.element(element)
        return $(element).scrollTop() + $(element).innerHeight() >= $(element)[0].scrollHeight
      }

      var hasScrollReachedTop = function(){
        element = angular.element(element)
        return $(element).scrollTop() === 0 ;
      }

      var updateScrollStatus = function() {

        var previousValue = scope.autoScrollDown;
        var newValue = hasScrollReachedBottom();

        if(hasScrollReachedTop()){
          
          var currentMessageId = MessageService.getMessages()[0].uuid
          MessageService.fetchPreviousMessages();
          ngNotify.set('Loading previous messages...');
          // Should be replaced by a promise !
          $timeout(function(){
            $anchorScroll(currentMessageId);
          }, 400);
          
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