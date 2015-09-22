var express = require('express'),
	app = express(),
	router = express.Router(),
	https = require('https'),
	qs = require('querystring'),
	fs = require('fs'),
	log4js = require('log4js'),
	logger = log4js.getLogger();

var authCode = '';
var access_token = '';

router.get('/auth', function(req, res){
	authCode = req.query.code;
	logger.info('/sc/auth: OA2 step 1: got auth code ' + req.query.code);
	res.render('sccallback');
})

router.get('/getOAToken', function(req, res) {
	// construct data object 
	var config = JSON.parse(fs.readFileSync('./config.json'));
	var data = qs.stringify({
		client_id 		: config.sc.client_id,
		client_secret 	: config.sc.client_secret,
		grant_type 		: 'authorization_code',
		redirect_uri 	: 'http://localhost:3000/sc/auth',
		code 			: authCode
	});

	// request to SoundCloud
	var options = {
		host : 'api.soundcloud.com',
		path : '/oauth2/token',
		method : 'POST',
		headers : {
			'Content-Type' : 'application/x-www-form-urlencoded',
        	'Content-Length': Buffer.byteLength(data),
		}
	}

	logger.debug('/sc/getOAToken: requesting token from soundcloud.com ')
	var scReq = https.request(options, function(scRes) {
		scRes.setEncoding('utf8');
		var str = '';
		scRes.on('data', function(chunk){
			str += chunk;
		});
		scRes.on('end', function(){
			if (scRes.statusCode != 200) {
				// do something
			} else {
				var result = JSON.parse(str);
				if (result.error != null){
					logger.error('/sc/getOAToken: Error getting OAuth token from Soundcloud: ' + result.error)
				} else {
					logger.info('/sc/getOAToken: Success getting Oauth token from Soundcloud: ' + result.access_token);
					access_token = result.access_token;
					res.end(access_token);
				}
			}
		});
	});

	scReq.write(data);
	scReq.end();
});

module.exports = router;