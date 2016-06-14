angular.module('app')
.factory('NotificationService', ['$rootScope', 'currentUser', 'Pubnub',
 function NotificationService($rootScope, currentUser, Pubnub) {
    
    
    var init = function(){

        var channelGroup = 'conversations_' + currentUser.get().id.toString();
        var eventName = Pubnub.getMessageEventNameFor(channelGroup);
        
        $rootScope.$on(eventName, function(ngEvent, message, env){
            let channel = env[3];

            // The user shouldn't receive his own messages
            if(message.sender.uuid.toString() === currentUser.get().id.toString()) return;

            var avatarUrl = 'https://avatars.githubusercontent.com/u/' + message.sender.uuid+'?s=80';

            Push.create('Message from '+message.sender.login, {
                body: message.content,
                timeout: 5000,
                icon: {
                    x16: avatarUrl,
                    x32: avatarUrl
                }
            });

        });
    }

    return {init: init};

}
]);