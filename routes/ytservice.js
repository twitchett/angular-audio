var express = require('express'),
	app = express(),
	router = express.Router(),
	log4js = require('log4js'),
	logger = log4js.getLogger(),
	https = require('https'),
	Track = require ('../models/track.js');

var key = 'AIzaSyClX5S0ua4r5yPD5wdASghAz4UzazQS7j0';
var userIp = '93.214.230.195';

module.exports.getVideo = function (req, out, callback) { 
	var options = getRequestOptions(req.body.id);

	logger.info('Making request:\n' + options.host + options.path)

	var yt_req = https.request(options, function(res){
		console.log("GOT STATUS CODE: ", res.statusCode);
		var str = '';
		res.on('data', function(chunk) {
			str += chunk;
		});
		res.on('end', function(){
			logger.info('Response string: ' + str);
			if (res.statusCode != 200) {
				callback("Error code " + res.statusCode, null, null);				
			} else {
				var data = JSON.parse(str);		
				if (data.items.length == 0) {
					callback("No items", null, null)
				} else {
					callback(null, convertToTrack(JSON.parse(str)), out);
				}
			}			
		});
	});

	yt_req.on('error', function(e) {
  		logger.error(e);
	});

	yt_req.end();
}

function getRequestOptions(id) {
	var fields = 'items(id,snippet(title,description))';
	var part = 'snippet'
	var url = '/youtube/v3/videos?id=' + id + '&part=' + part + '&fields=' + fields + '&key=' + key + '&userIp=' + userIp; 
	var options = {
		host : 'www.googleapis.com',
		path : url,
		method : 'GET'
	}
	return options;
}

module.exports.getPlaylist = function(id) {
	var options = {};
	var tracks = [];

	// make call
	// convert to objects

	return tracks;
}

convertToTrack = function (data) {
	var track = new Track({
		userId : currentUser,
		src: 'yt',
		srcId: data.items[0].id,
		name: data.items[0].snippet.title
	});
	track.save(function(err, data){
	 	if (err) {
	 		logger.error(err);
	 		return null;
	 	} 
	 	console.dir('call back data: ' + data);
	 	console.dir('new track: ' + track);
	 	return track;
	});
}

module.exports.convertAllToTracks = function(data) {
	var tracks = [];
	for (var i=0; i<data.items.length; i++) {
		tracks[i] = new Track({
			userId : currentUser,
			src: 'yt',
			srcId: data.items[i].id,
			name: data.items[i].snippet.title
		});
	}
	Track.create(tracks, function(err) {
		if (err) return logger.error(err);
		logger.info('Saved ' + arguments.length + ' tracks');
	});
	return tracks;
}

//module.exports = router;
