/* ---------------------------------------------------------/
*
* REST API: provides CRUD functionality for Track objects
* Routes are mounted on path '/api'
* See also: trackService.js in front end
*
* Currently working endpoints:
* 	GET /api/tracks
*	POST /api/tracks
*	POST /api/track
*
* --------------------------------------------------------- */

(function (module) {

	'use strict';

	var router = require('express').Router(),
		logger = require('log4js').getLogger('api'),
		util = require('util'),
		User = require ('../models/user.js'),
		Track = require ('../models/track.js');

	/*
	* HTTP GET: gets the library of user with 'id'
	*
	* Returns an array of Track models to the client.
	*/ 
	router.get('/tracks', (req, res) => {
		var userId = getUserId(req);

		if (!userId) {
			res.status(400).send('error: could not get user from request');
			return;
		}

		Track.findByUserId(userId, (err, tracks) => {
			if (err) {
				logger.error('error getting tracks from db: ', err, req.user);
				res.status(500).send('error: could not retrieve library');
			} else {
				res.send(tracks);
			}
		});
	});

	/*
	* HTTP GET: gets a single track with id 'id'
	*/ 
	router.get('/track/:id', (req, res) => {
		// TODO: implement
	});

	/*
	* HTTP POST: adds a single track
	*
	* The newly created track is returned to the client.
	* The userId should be included in the track data in the request (req.body.userId)
	* If there is no userId, an error will be thrown during Track.create().
	*/
	router.post('/track', (req, res) => {
		logger.debug('POST /api/track got req ' + util.inspect(req.body));
		var data = req.body;

		if (!data) {
			res.status(400).send('error: no data in request');
		}

		Track.create(data, (err, track) => {
			if (err) {
				logger.error('error creating track', err);
				// duplicate key - assuming it is srcId (dangerous!)
				if (err.code === 11000) { 
					res.status(403).send('error: track already exists');
				} else {
					res.status(500).send('error: could not save track');
				}
			} else {
				res.send(track);
			}
		});
	});


	/*
	* HTTP POST: adds a collection of tracks
	*
	* An array of the newly-created tracks is returned to the client.
	* Each track should contain the userId or creation will fail.
	*
	* NOTE: if a single track fails, all tracks will fail!
	*/ 
	router.post('/tracks', (req, res) => {
		var data = req.body;
		if (req.body && req.body.length) {
			logger.debug('POST /api/tracks got this number of tracks: ' + util.inspect(req.body.length));
			
			/*
			* NOTE: if one fails, no tracks are written and an error is retrned.
			* MongoDB provides a 'continueOnError' flag, however this is not supported by Mongoose.
			*/
			Track.create(data, (err, tracks) => {
				if (err) {
					logger.error('creating tracks failed: ', err);
					var msg = 'error: could not add tracks';
					if (error.code === 11000) {
						msg = 'error: duplicate track(s) found'
					} 
					res.status(500).send(msg);
				} else {
					res.send(tracks);	
				}
			});

		} else {
			res.status(400).send('error: no data in request');
		}
	});

	// Updates a single track (all attributes)
	router.put('/track/:id', (req, res) => {
		logger.info('PUT /api/track with ' + util.inspect(req.body));
		var data = req.body;
		Track.findOneAndUpdate({ _id: data._id }, data, (err, data) => {
			// TODO
		});
	});

	// HTTP PATCH: Updates a single track (selected attributes only)
	router.patch('/track/:id', (req, res) => {
		logger.info('PATCH /api/track with ' + util.inspect(req.body));
		var data = req.body;
		Track.findOneAndUpdate({ _id: req.body._id }, req.body, (err, data) => {
			// TODO
		});
	});

	/*
	* HTTP POST: adds a playlist
	*/
	router.post('/api/playlist', (req, res) => {
		logger.info('/api/tracks got this number of tracks: ' + util.inspect(req.body.length));
		var tracks = req.body;

		// TODO: implement (eventually split into playlistApi)

		// need to: 1) add new tracks to db and 2) create playlist with array of tracks
		// loop through tracks, adding id to list.
		// if new track encountered, add to db, then add its id to the list.

	});


	/*
	* HTTP DELETE: removes a single track
	*/
	router.delete('/track/:id', (req, res) => {
		logger.debug('DELETE /api/track/ with ' + util.inspect(req.params));
		var userId = getUserId(req);
		var trackId = req.params.id;

		if (!userId || !trackId) {
			res.status(400).send('error: could not get user or track from request');
			return;
		}

		Track.findByIdAndRemove(trackId, (err, data) => {
			if (err) {
				logger.error(err);
				res.status(500).send('error: there was an error deleting track ' + trackId)
			} else {
				logger.debug(data);
				res.end();
			}
		});
	});

	function getUserId(req) {
		if (req && req.user) {
			if (req.user.length == 1) {
				return req.user[0].id;	
			} else {
				logger.warn('api getUserId(): unexpected req.user object: ', req.user)
			}
		} else {
			if (req) logger.warn('api getUserId(): unexpected req.user object: ', req.user)
		}
	}

	module.exports = router;

})(module);
