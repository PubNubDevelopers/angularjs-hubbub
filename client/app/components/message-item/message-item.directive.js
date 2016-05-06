angular.module('app').directive('messageItem', function() {
  return {
    restrict: "E",
    templateUrl: 'components/message-item/message-item.html',
    scope: {
      senderUuid: "@",
      senderLogin: "@",
      content: "@",
      date: "@"
    }
  };
});