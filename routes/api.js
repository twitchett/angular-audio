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
	Track.create(data, function(err, data) {
		if (err) {
			logger.error(err);
			if (err.code === 11000) { // duplicate key
				res.writeHead(403, {'Content-Type': 'application/json'});
				res.end(JSON.stringify('track already exists'));
			} else {
				res.writeHead(500, {'Content-Type': 'application/json'});
				res.end(JSON.stringify('error saving track'));
			}
		} else {
			logger.info(data)
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.end(JSON.stringify(data));
		}
	});
});


// HTTP POST: adds a collection of tracks
//
// NOTE #1: we can pass an array to Track.create, but then the callback-data is
// only the NUMBER of items created, not the actual items. we should return a
// list of the created models (in the same order as we got them).
//
// NOTE #2: but Track.create does not do a batch insert - for this we need to use
// the native mongoDB driver (which will bypass all mongoose hooks)
//
router.post('/api/tracks/:id', function(req, res) {
	if (req.body && req.body.length) {
		logger.info('POST /api/tracks got this number of tracks: ' + util.inspect(req.body.length));

		var tracks = req.body,
			userId = req.params.userId,
			counter = 0,
			errors = 0,
			returnTracks = [];

		// tracks = tracks.slice(1,10); // testing on subset


		for (var i=0; i<tracks.length; i++) {
			logger.info('creating track at position ' + i + ' of ' + tracks.length);		
			Track.create(tracks[i], function(err, data) {
				counter++;
				if (!err) {				
					returnTracks.push(true);
				} else {
					errors++;
					returnTracks.push(false);
					logger.error('error ' + err + ', could not create track ', data)
				}
				// TODO: refactor
				if (counter == tracks.length) {
					res.writeHead(200, {'Content-Type': 'application/json'});
					logger.info('writing output: ' + JSON.stringify(returnTracks));
					res.end(JSON.stringify(returnTracks));
				} else {
					// return error to client
				}
			});
		}

		// for (var i=0; i<tracks.length; i++) {
		// 	logger.info('creating track at position ' + i + ' of ' + tracks.length);		
		// 	Track.create(tracks[i], function(err, data) {
		// 		counter++;
		// 		if (!err) {				
		// 			returnTracks.push(data);
		// 		} else {
		// 			errors++;
		// 			logger.error('error ' + err + ', could not create track ', data)
		// 		}
		// 		// TODO: refactor
		// 		if (counter == tracks.length) {
		// 			res.writeHead(200, {'Content-Type': 'application/json'});
		// 			logger.info('writing output: ' + JSON.stringify(returnTracks));
		// 			res.end(JSON.stringify(returnTracks));
		// 		} else {
		// 			// return error to client
		// 		}
		// 	});
		// }
	} else {
		logger.warn('got /api/tracks/ request with no data')
	}
});

// Updates a single track (all attributes)
router.put('/api/track/:id', function(req, res) {
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
