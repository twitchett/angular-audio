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

	const ERR_CODE_DUPLICATE = 11000;

	/*
	* HTTP GET: gets the library of user with 'id'
	*
	* Returns an array of Track models to the client.
	*/ 
	router.get('/tracks', (req, res) => {
		let userId = getUserId(req);

		if (!userId) {
			res.status(400).send('error: could not get user from request');
			return;
		}

		let errMsg = 'error retrieving tracks for user ' + userId;

		Track.findByUserId(userId)
			.then
			(
				tracks => res.send(tracks),
				ex => handleError(ex, res, errMsg)
			)
			.catch(ex => handleError(ex, res, errMsg));
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
		let userId = getUserId(req);

		if (!userId) {
			res.status(400).send('error: could not get user from request');
			return;
		}

		// TODO: add userId here e.g. preprocessData(data);

		if (!req.body) {
			res.status(400).send('error: no data in request');
		}

		let saveSuccessHandler = function successHandler(track) {
			res.send(track);
		}

		let saveErrorHandler = function postErrorHandler(err) {
			if (err.code === ERR_CODE_DUPLICATE) {
				res.status(403).send('error: track already exists');
			} else {
				handleError(err, res, 'error: could not save track');
			}
		}

		new Track(req.body)
			.save()
			.then(saveSuccessHandler, saveErrorHandler)
		 	.catch(ex => handleError(ex, res, 'error: could not save track'));
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
		let userId = getUserId(req);
		let data = req.body;

		if (req.body && req.body.length) {
			logger.debug('POST /api/tracks got this number of tracks: ' + util.inspect(req.body.length));
			let errMsg = 'error: could not save tracks';
			
			/*
			* NOTE: if one fails, no tracks are written and an error is retrned.
			* MongoDB provides a 'continueOnError' flag, however this is not supported by Mongoose.
			*/
			Track.create(data)
				.then
				(
					tracks => res.send(tracks),
					err => handleError(err, res, errMsg)
				)
				.catch(ex => handleError(ex, res, errMsg));

		} else {
			res.status(400).send('error: no data in request');
		}
	});

	// Updates a single track (all attributes)
	router.put('/track/:id', (req, res) => {
		logger.info('PUT /api/track with ' + util.inspect(req.body));
		let data = req.body;
		Track.findOneAndUpdate({ _id: data._id }, data, (err, data) => {
			// TODO
		});
	});

	// HTTP PATCH: Updates a single track (selected attributes only)
	router.patch('/track/:id', (req, res) => {
		logger.info('PATCH /api/track with ' + util.inspect(req.body));
		let data = req.body;
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
		let userId = getUserId(req),
			trackId = req.params.id;

		if (!userId || !trackId) {
			res.status(400).send('error: could not get user or track from request');
			return;
		}

		let errMsg = 'error: there was an error deleting track ' + trackId;

		Track.findByIdAndRemove(trackId)
			.exec()
			.then
			(
				() => res.end(),
				err => handleError(err, res, errMsg)
			)
			.catch(ex => handleError(err, res, errMsg));
	});

	var handleError = function handleError(err, res, msg) {
		logger.error(err);
		res.status(500).send(msg);
	}

	var getUserId = function getUserId(req) {
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
