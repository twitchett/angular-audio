var router = require('express').Router(),
	https = require('https'),
	qs = require('querystring'),
	User = require ('../models/user.js'),
	logger = require('log4js').getLogger('scservice'),
	config = require('../config.json');

/* ---------------------------------------------------------/
*
* Provides URIs used in the OAuth2 authorization of a SoundCloud user.
* /sc/auth is called, which shows a popup requesting the user's permission.
* /sc/getOAToken is then called, which obtains an access token from SoundCloud.
*
* Paths:
* 	GET /sc/auth
*	GET /sc/getOAToken
*
* --------------------------------------------------------- */

// temporary... 
var authCode = '';

/*
* GET /sc/auth
*/
router.get('/auth', function (req, res) {
	authCode = req.query.code;
	logger.debug('/auth: OA2 step 1: got auth code ' + authCode);
	res.render('sccallback');
})

/*
* GET /sc/getOAToken
*
* Using the authCode obtained in step 1, makes a POST request to SoundCloud to obtain an access token.
* Returns the token to the client. If an access token is provided in the request, the new soundcloud token is saved on the user model.
*
* Not securing this route means that users can use the app without having to go through the signup process
*/
router.get('/getOAToken', function (req, res) {
	logger.debug('/sc/getOAToken: OA2 step 2: requesting token from soundcloud.com ')

	// error message to return to user (temp)
	var errMsg = 'There was an error authorizing with SoundCloud';

	// data to send in POST request to SC
	var postData = qs.stringify({
		client_id 		: config.sc.client_id,
		client_secret 	: config.sc.client_secret,
		grant_type 		: 'authorization_code',
		redirect_uri 	: config.sc.redirect_uri, // http://localhost:3000/sc/auth,
		code 			: authCode
	});

	// HTTP POST options for SoundCloud request
	var options = {
		host 	: 'api.soundcloud.com',
		path 	: '/oauth2/token',
		method 	: 'POST',
		headers : {
			'Content-Type' : 'application/x-www-form-urlencoded',
        	'Content-Length': Buffer.byteLength(postData),
		}
	}

	// construct request (ewww, refactor this)
	var sc_req = https.request(options, function (sc_res) {
		sc_res.setEncoding('utf8');

		if (sc_res.statusCode != 200 ) {
			logger.error('/getOAToken: Error getting access token from Soundcloud, statusCode ' + sc_res.statusCode);
			res.status(500).send(errMsg);
		} 

		var data = '';

		sc_res.on('data', function (chunk) {
			data += chunk;
		});

		sc_res.on('end', function() {
			handleResult(data); 
		});

		sc_res.on('error', function (e) {
			logger.error('/getOAToken: error getting response from SoundCloud: ' + e.getMessage());
			res.status(500).send(errMsg);
		});
	});

	// TODO 1: return something useful on error
	// TODO 2: persist access token in DB
	var handleResult = function handleResult (data) {
		if (!data) {
			logger.error('/getOAToken: no data in handleResult()!');
			res.status(500).send(errMsg);

		} else {
			var result = JSON.parse(data);

			if (result.error != null){
				logger.error('/getOAToken: Error getting OAuth2 token from Soundcloud: ' + result.error)

				res.status(500).send(errMsg)

			} else {
				// TODO: process scope/refresh token
				// if user is logged in, add access token to user model
				var access_token = result.access_token
				logger.info('/getOAToken: Success getting OAuth2 token from Soundcloud: ' + result.access_token);
				persistToken(req, access_token);

				res.send(access_token);
			}
		}
	};

	// if the user is authenticated, find the user in the DB and persist the token
	// we cannot just access the 'user' on the req object because this route is not auth'd with passport
	var persistToken = function persistToken(req, sc_token) {
		// extract token from authorization header
		if (req && req.headers && req.headers.authorization) {
			var authHeader = req.headers.authorization;
			var searchStr = "Bearer "; 	// NOTE: case-senstive!
			
			// find the user by access token supplied in the original request
			if (authHeader.indexOf(searchStr) === 0) {

				var token = authHeader.substring(searchStr.length); 	// perform some checks on token?
				var query = { primaryToken : token };
				var update = { soundcloudToken : sc_token };
				var opts = { new : true};				// returns the updated model
				console.log('finding by token ' + token);

				var callback = function(err, user) {
					if (err) logger.error('persistToken() error saving sc_token: ' + err);
					else if (user) logger.debug('persistToken() saved sc_token to user ' + user.email);
					else (logger.warn('persistToken() WTF: could not find user for primary access token ' + token));
				}

				User.findOneAndUpdate(query, update, opts, callback);
			}
		}
	}

	// send the request
	sc_req.write(postData);
	sc_req.end();
});

module.exports = router;