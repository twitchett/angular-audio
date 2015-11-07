var express = require('express'),
	app = express(),
	router = express.Router(),
	https = require('https'),
	qs = require('querystring'),
	fs = require('fs'),
	log4js = require('log4js'),
	logger = log4js.getLogger();

/* ---------------------------------------------------------/
*
* REST API: provides CRUD functionality for Track objects
* Routes are mounted on path '/sc'
* See also: importScAuthService.js in front end
*
* Currently working endpoints:
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
	logger.debug('/sc/auth: OA2 step 1: got auth code ' + authCode);
	res.render('sccallback');
})

/*
* GET /sc/getOAToken
*
* Using the authCode obtained in step 1, makes a POST request to SoundCloud
* to obtain an access token.
* Returns the token to the client (also needs to be persisted!)
*/
router.get('/getOAToken', function (req, res) {
	logger.debug('/sc/getOAToken: OA2 step 2: requesting token from soundcloud.com ')
	
	// get app config
	var config = JSON.parse(fs.readFileSync('./config.json'));

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
			logger.error('/sc/getOAToken: Error getting access token from Soundcloud, statusCode ' + sc_res.statusCode);
			res.end();
			// do something
		} 
		var data = '';
		sc_res.on('data', function (chunk) {
			data += chunk;
		});
		sc_res.on('end', function() {
			handleResult(data); 
		});
		sc_res.on('error', function (e) {
			logger.error('/sc/getOAToken: error getting response from SoundCloud: ' + e.getMessage());
			res.end();
		});
	});

	// send the request
	sc_req.write(postData);
	sc_req.end();

	// TODO 1: return something useful on error
	// TODO 2: persist access token in DB
	function handleResult(data) {
		if (!data) {
			logger.error('/sc/getOAToken: no data in handleResult()!');
			res.end();
		} else {
			var result = JSON.parse(data);
			if (result.error != null){
				logger.error('/sc/getOAToken: Error getting OAuth token from Soundcloud: ' + result.error)
				res.end();
			} else {
				// TODO: process scope/refresh token
				logger.info('/sc/getOAToken: Success getting Oauth token from Soundcloud: ' + result.access_token);
				res.end(access_token);
			}
		}
	};
});

module.exports = router;