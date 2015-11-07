var express = require('express'),
	router = express.Router(),
	log4js = require('log4js'),
	https = require('https'),
	util = require('util');
	User = require ('../models/user.js');
	Track = require ('../models/track.js');

var	logger = log4js.getLogger();

/* ---------------------------------------------------------/
*
* REST API: provides CRUD functionality for Track objects
* Routes are mounted on path '/api'
* See also: trackService.js in front end
*
* Currently working endpoints:
* 	GET /api/library/:id
*	GET /api/track/:id
*	POST /api/tracks
*	POST /api/track
*
* --------------------------------------------------------- */


/*
* HTTP GET: gets the library of user with 'id'
*
* TODO 1) rename this route to /tracks!
*/ 
router.get('/library/:id', function (req, res) {
	logger.info('GET /api/library/id with ' + util.inspect(req.params));
	var userId = req.params.id;

	// TODO 2) make this call with promises
	
	// Track.findByUserId(userId).then(function(tracks) {
	// 	res.writeHead(200, {'Content-Type': 'application/json'});
	// 	res.end(JSON.stringify(tracks));	
	// },
	// function(error) {
	// 	logger.error(err);
	// 	res.writeHead(400, {'Content-Type': 'application/json'});
	// 	res.end();
	// });

	Track.findByUserId(userId, function (err, tracks) {
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

/*
* HTTP GET: gets a single track with id 'id'
*/ 
router.get('/track/:id', function (req, res) {

	// TODO: implement

});

/*
* HTTP POST: adds a single track
*
* The userId should be included in the track data in the request (req.body.userId)
* If there is no userId, an error will be thrown during Track.create().
*/
router.post('/track', function (req, res) {
	logger.info('POST /api/track got req ' + util.inspect(req.body));
	var data = req.body;

	if (!data) {
		// do error
	}

	Track.create(data).then(function (track) {
		logger.info('created track ', track)
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.end(JSON.stringify(track));
	},
	function (error) {
		logger.error('error creating track', err);
		// duplicate key - assuming it is srcId (dangerous!)
		if (err.code === 11000) { 
			res.writeHead(403, {'Content-Type': 'application/json'});
			res.end(JSON.stringify('error: track already exists'));
		} else {
			res.writeHead(500, {'Content-Type': 'application/json'});
			res.end(JSON.stringify('error: could not save track'));
		}
	});
});


/*
* HTTP POST: adds a collection of tracks
*
* Each track should contain the userId.
*/ 
router.post('/tracks', function (req, res) {
	if (req.body && req.body.length) {
		logger.info('POST /api/tracks got this number of tracks: ' + util.inspect(req.body.length));
		var data = req.body;

		/*
		* NOTE: if one fails, no tracks are written and an error is retrned.
		* MongoDB provides a 'continueOnError' flag, however this is not supported by Mongoose.
		*/
		Track.create(data).then(function (tracks) {
			logger.info('created tracks! ', tracks);
			res.end(JSON.stringify(tracks));
		},
		function (error) {
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
router.put('/track/:id', function(req, res) {
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
router.patch('/track/:id', function(req, res) {
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

/*
* HTTP POST: adds a playlist
*/
router.post('/api/playlist', function(req, res) {
	console.log('/api/tracks got this number of tracks: ' + util.inspect(req.body.length));
	var tracks = req.body;

	// TODO: implement (eventually split into playlistApi)

	// need to: 1) add new tracks to db and 2) create playlist with array of tracks
	// loop through tracks, adding id to list.
	// if new track encountered, add to db, then add its id to the list.

});


/*
* HTTP DELETE: removes a single track
*/
router.delete('/track/:id', function (req, res) {
	console.log('DELETE /api/track/ with ' + util.inspect(req.params));
	var userId = req.params.id,
		trackId = req.body._id;

	Track.findByIdAndRemove(trackId, function (err, data) {
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

module.exports = router;
