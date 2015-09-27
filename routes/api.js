var express = require('express'),
	router = express.Router(),
	log4js = require('log4js'),
	https = require('https'),
	util = require('util');
	User = require ('../models/user.js');
	Track = require ('../models/track.js');

var	logger = log4js.getLogger();


/*
* REST API: provides CRUD functionality for Track objects
*/

// HTTP GET: gets the library of user with 'id'
router.get('/api/library/:id', function(req, res) {
	logger.info('GET /api/library/id with ' + util.inspect(req.params));
	var userId = req.params.id;

	// TODO: make this call with promises
	//
	// Track.findByUserId(userId).then(function(tracks) {
	// 	res.writeHead(200, {'Content-Type': 'application/json'});
	// 	res.end(JSON.stringify(tracks));	
	// },
	// function(error) {
	// 	logger.error(err);
	// 	res.writeHead(400, {'Content-Type': 'application/json'});
	// 	res.end();
	// });

	Track.findByUserId(userId, function(err, tracks) {
		if (err) {
			logger.error(err);
			res.writeHead(400, {'Content-Type': 'application/json'});
			res.end();
		} else {
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.end(JSON.stringify(tracks));
		}
	});
});

// HTTP DELETE: removes a single track
router.delete('/api/track/:id', function(req, res) {
	console.log('DELETE /api/track/ with ' + util.inspect(req.params));
	var userId = req.params.id,
		trackId = req.body._id;
	Track.findByIdAndRemove(trackId, function(err, data){
		if (err) {
			logger.error(err);
			res.writeHead(400, {'Content-Type': 'application/json'});
			res.end();
		} else {
			logger.info(data)
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.end(JSON.stringify(data));
		}
	});
});

// HTTP POST: adds a single track
router.post('/api/track/:id', function(req, res) {
	console.log('POST /api/track got req ' + util.inspect(req.body));
	var data = req.body;

	Track.create(data).then(function(track) {
		logger.info('created track ', track)
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.end(JSON.stringify(data));
	},
	function(error) {
		logger.error('error creating track', err);
		if (err.code === 11000) { // duplicate key - assuming it is srcId (dangerous!)
			res.writeHead(403, {'Content-Type': 'application/json'});
			res.end(JSON.stringify('error: track already exists'));
		} else {
			res.writeHead(500, {'Content-Type': 'application/json'});
			res.end(JSON.stringify('error: could not save track'));
		}
	});
});


// HTTP POST: adds a collection of tracks
router.post('/api/tracks/:id', function(req, res) {
	if (req.body && req.body.length) {
		logger.info('POST /api/tracks got this number of tracks: ' + util.inspect(req.body.length));

		var tracks = req.body,
			userId = req.params.userId;

		/*
		* NOTE: if one fails, no tracks are written and an error is retrned.
		* MongoDB provides a 'continueOnError' flag, however this is not supported by Mongoose.
		*/
		Track.create(tracks).then(function(data) {
			logger.info('created tracks! data ', data);
			res.end(JSON.stringify(data));
		},
		function(error) {
			logger.debug('creating tracks failed: ', error);
			var msg = 'error: could not add tracks';
			if (error.code === 11000) {
				msg = 'error: duplicate track(s) found'
			} 
			res.writeHead(403, {'Content-Type': 'application/json'});
			res.end(JSON.stringify(msg));
		});

	} else {
		logger.warn('got /api/tracks/ request with no data')
	}
});

// Updates a single track (all attributes)
router.put('/api/track/:id', function(req, res) {
	logger.info('PUT /api/track with ' + util.inspect(req.body));
	var data = req.body;
	Track.findOneAndUpdate({ _id: data._id }, data, function(err, data) {
		if (err) {				
			logger.error(err);
			res.writeHead(400, {'Content-Type': 'application/json'});
			res.end();
		} else {
			logger.info(data)
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.end(JSON.stringify(data));
		}

	});
});

// HTTP PATCH: Updates a single track (selected attributes only)
router.patch('/api/track/:id', function(req, res) {
	logger.info('PUT /api/track with ' + util.inspect(req.body));
	var data = req.body;
	Track.findOneAndUpdate({ _id: req.body._id }, req.body, function(err, data) {
		if (err) {				
			logger.error(err);
			res.writeHead(400, {'Content-Type': 'application/json'});
			res.end();
		} else {
			logger.info(data)
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.end(JSON.stringify(data));
		}

	});
});


router.post('/api/playlist', function(req, res) {
	console.log('/api/tracks got this number of tracks: ' + util.inspect(req.body.length));
	var tracks = req.body;

	// TODO: implement (eventually split into playlistApi)

	// need to: 1) add new tracks to db and 2) create playlist with array of tracks
	// loop through tracks, adding id to list.
	// if new track encountered, add to db, then add its id to the list.

});

module.exports = router;
