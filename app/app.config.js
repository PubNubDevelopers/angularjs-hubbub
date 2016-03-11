  angular
  .module('app')
  .run(['Pubnub','currentUser', function(Pubnub, currentUser) {

    Pubnub.init({
          publish_key: 'pub-c-a1cd7ac1-585e-478e-925b-65d17ce62f7d',
          subscribe_key: 'sub-c-204f063e-c559-11e5-b764-02ee2ddab7fe',
          uuid: currentUser,
          origin: 'pubsub.pubnub.com',
          ssl: true,
          heartbeat: 40,
          heartbeat_interval: 60
      });

  }])
  .run(['ngNotify', function(ngNotify) {

      ngNotify.config({
          theme: 'paster',
          position: 'top',
          duration: 250
      });

  }]);