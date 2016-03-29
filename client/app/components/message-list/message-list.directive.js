angular.module('app').directive('messageList', function($rootScope, $anchorScroll, MessageService, ngNotify) {
  return {
    restrict: "E",
    replace: true,
    templateUrl: 'components/message-list/message-list.html',

    link: function(scope, element, attrs, ctrl) {

      var element = angular.element(element)

      var scrollToBottom = function() {
          element.scrollTop(element.prop('scrollHeight'));
      };

      var hasScrollReachedBottom = function(){
        return element.scrollTop() + element.innerHeight() >= element.prop('scrollHeight')
      };

      var hasScrollReachedTop = function(){
        return element.scrollTop() === 0 ;
      };

      var fetchPreviousMessages = function(){

        ngNotify.set('Loading previous messages...','success');

        var currentMessage = MessageService.getMessages()[0].uuid

        MessageService.fetchPreviousMessages().then(function(m){

          // Scroll to the previous message 
          $anchorScroll(currentMessage);

        });

      };

      var watchScroll = function() {

        if(hasScrollReachedTop()){

          if(MessageService.messagesAllFetched()){
            ngNotify.set('All the messages have been loaded', 'grimace');
          }
          else {
            fetchPreviousMessages();
          }
        }

        // Update the autoScrollDown value 
        scope.autoScrollDown = hasScrollReachedBottom()

      };

      var init = function(){
          
          // Scroll down when the list is populated
          var unregister = $rootScope.$on('factory:message:populated', function(){ 
            // Defer the call of scrollToBottom is useful to ensure the DOM elements have been loaded
            _.defer(scrollToBottom);
            unregister();

          });

          // Scroll down when new message
          MessageService.subscribeNewMessage(function(){
            if(scope.autoScrollDown){
              scrollToBottom()
            }
          });

          // Watch the scroll and trigger actions
          element.bind("scroll", _.debounce(watchScroll,250));
      };

      init();

    },
    controller: function($scope){
      // Auto scroll down is acticated when first loaded
      $scope.autoScrollDown = true;
      
      $scope.messages = MessageService.getMessages();
    }
  };
});