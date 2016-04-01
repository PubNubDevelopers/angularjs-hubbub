var express = require('express');
var http = require("http");
var router = express.Router();
var bodyParser = require('body-parser');
var parseUrlencoded = bodyParser.urlencoded({ extended: false });
var request = require('request');
var qs = require('querystring');

/*
 |--------------------------------------------------------------------------
 | Login with GitHub
 |--------------------------------------------------------------------------
*/

router.route('/auth/github')
	.post(function(req, res) {

	  var accessTokenUrl = 'https://github.com/login/oauth/access_token';

	  var params = {
	    code: req.body.code,
	    client_id: req.body.clientId,
	    client_secret: '3c69fde2d90e34e6ccc7eafd5920bf51d0f540e0',
	    redirect_uri: req.body.redirectUri
	  };

	  // Exchange authorization code for access token.
	  request.post({ url: accessTokenUrl, qs: params }, function(err, response, token) {

	  	   token = qs.parse(token);
	  	   accessToken = token.accessToken;

	       res.send({token: token.access_token});
	  });
	});

module.exports = router;