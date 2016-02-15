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
*	POST /api/track/:id
*
* --------------------------------------------------------- */

(function (module) {

	'use strict';

	var router = require('express').Router(),
		logger = require('log4js').getLogger('api-tracks'),
		util = require('util'),
		User = require ('../models/user.js'),
		Track = require ('../models/track.js');
		
	const ERR_MSG_NO_USERID = 'error: could not get user from request';

	/*
	* HTTP GET: gets the library of user with 'id'
	*
	* Returns an array of Track models to the client.
	*/ 
	router.get('/tracks', (req, res, next) => {
		let userId = getUserId(req);

		if (!userId) {
			return next(new Error(ERR_MSG_NO_USERID));
		}

		Track.findByUserId(userId)
			.then
			(
				tracks => res.send(tracks),
				err => next(err)
			)
			.catch(ex => next(ex));
	});

	/*
	* HTTP GET: gets a single track with id 'id'
	*/ 
	router.get('/track/:id', (req, res, next) => {
		// TODO: implement
	});

	/*
	* HTTP POST: adds a single track
	*
	* The newly created track is returned to the client.
	* The userId should be included in the track data in the request (req.body.userId)
	* If there is no userId, an error will be thrown during Track.create().
	*/
	router.post('/track', (req, res, next) => {
		logger.debug('POST /api/track got req ' + util.inspect(req.body));
		let userId = getUserId(req);

		if (!userId) {
			return next(new Error(ERR_MSG_NO_USERID));
		}

		// TODO: add userId here e.g. preprocessData(data);

		if (!req.body) {
			return next(new Error('POST /api/track error: no data in request'));
		}

		let saveSuccessHandler = function successHandler(track) {
			res.send(track);
		}

		let saveErrorHandler = function postErrorHandler(err) {
			return next(err);
		}

		new Track(req.body)
			.save()
			.then(saveSuccessHandler, saveErrorHandler)
		 	.catch(ex => next(ex));
	});


	/*
	* HTTP POST: adds a collection of tracks
	*
	* An array of the newly-created tracks is returned to the client.
	* Each track should contain the userId or creation will fail.
	*
	* NOTE: if a single track fails, all tracks will fail!
	*/ 
	router.post('/tracks', (req, res, next) => {
		let userId = getUserId(req);

		if (!userId) {
			return next(new Error(ERR_MSG_NO_USERID));
		}

		let data = req.body;

		if (req.body && req.body.length) {
			logger.debug('POST /api/tracks got this number of tracks: ' + util.inspect(req.body.length));
			
			/*
			* NOTE: if one fails, no tracks are written and an error is retrned.
			* MongoDB provides a 'continueOnError' flag, however this is not supported by Mongoose.
			*/
			Track.create(data)
				.then
				(
					tracks => res.send(tracks),
					err => next(err)
				)
				.catch(ex => next(ex));

		} else {
			return next(new Error('error: no data in request'));
		}
	});


	/*
	* Updates track properties (not tags)
	*/
	router.post('/track/:id', (req, res, next) => {
		let userId = getUserId(req);

		if (!userId) {
			return next(new Error(ERR_MSG_NO_USERID));
		}

		if (req.body) {
			let data = req.body;
			let trackId = req.params.id;
			
			Track.findOneAndUpdate
			(
				{ userId : userId, _id : trackId },
				{ $addToSet : data },
				{ new : true }
			)
			.exec()
			.then
			(
				data => res.send(data),
				err => next(err)
			);
		} else {
			return next(new Error('error: no data in request'));
		}

	});

	// Replaces a track
	router.put('/track/:id', (req, res, next) => {
		logger.info('PUT /api/track with ' + util.inspect(req.body));
		let data = req.body;
		Track.findOneAndUpdate({ _id: data._id }, data, (err, data) => {
			// TODO
		});
	});

	/*
	* HTTP POST: adds a playlist
	*/
	router.post('/playlist', (req, res, next) => {
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
	router.delete('/track/:id', (req, res, next) => {
		logger.debug('DELETE /api/track/ with ' + util.inspect(req.params));
		let userId = getUserId(req);
		let	trackId = req.params.id;

		if (!userId) {
			return next(new Error(ERR_MSG_NO_USERID));
		}

		let errMsg = 'error: there was an error deleting track ' + trackId;

		Track.findByIdAndRemove(trackId)
			.exec()
			.then
			(
				() => res.end(),
				err => next(err)
			)
			.catch(ex => next(ex));
	});

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
