angular.module('app').directive('messageList', function($rootScope, $anchorScroll, $timeout, MessageService, ngNotify) {
  return {
    restrict: "E",
    replace: true,
    templateUrl: 'components/message-list/message-list.html',

    link: function(scope, element, attrs, ctrl) {

      var element = angular.element(element)

      var hasScrollReachedBottom = function(){
        return element.scrollTop() + element.innerHeight() >= element.prop('scrollHeight')
      };

      var hasScrollReachedTop = function(){
        return element.scrollTop() === 0 ;
      };

      var fetchPreviousMessages = function(){

        //ngNotify.set('Loading previous messages...','success');

        var currentMessage = scope.messages[0].uuid.toString();

        scope.messages.$load(10).then(function(m){

          // Scroll to the previous message 
          _.defer( function(){ $anchorScroll(currentMessage) });

        });

      };

      var watchScroll = function() {

        if(hasScrollReachedTop()){

          if(scope.messages.$allLoaded()){
            ngNotify.set('All the messages have been loaded', {
              type: 'messages-all-fetched',
              target: '.message-list',
              duration: 2000
            })
          }
          else {
            fetchPreviousMessages();
          }
        }

        // Update the autoScrollDown value 
        scope.autoScrollDown = hasScrollReachedBottom()

      };

      var init = function(){
          
          // Watch the scroll and trigger actions
          element.bind("scroll", _.throttle(watchScroll,250));
      };

      init();

    },
    controller: function($scope){
      // Auto scroll down is acticated when first loaded
      $scope.autoScrollDown = true;
        
      $scope.messages = MessageService;

      // Hook that is called once the list is completely rendered
      $scope.listDidRender = function(){
        
          if($scope.autoScrollDown)
              $scope.scrollToBottom()

      };

      $scope.scrollToBottom = function() {
          
          var uuid_last_message = _.last($scope.messages).uuid;
          $anchorScroll(uuid_last_message);

      };

    }
  };
});