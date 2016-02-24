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

          if(scope.messagesAllFetched){
            ngNotify.set('All the messages have been loaded', 'grimace');
          }
          else {

            ngNotify.set('Loading previous messages...','success');

            MessageService.fetchPreviousMessages().then(function(m){

              if(m[0].length <= 0){
                scope.messagesAllFetched = true
              }
              
              $anchorScroll(currentMessageId);
            });

          }
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
      // Indicates wether all the messages have been fetched or not.
      $scope.messagesAllFetched = false;
    }
  };
});