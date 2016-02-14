angular.module('app')
.factory('User', function UserFactory() {
  
  var User = function(uuid){
  	this.uuid = uuid ;
  }

  User.prototype.getUuid = function(){
  	return this.uuid;
  }

  User.prototype.getAvatarUrl = function(){
  	return 'http://robohash.org/'+this.uuid+'?set=set2&bgset=bg2&size=70x70';
  }

  return User;

});
