/* ---------------------------------------------------------/
*
* REST API for adding, deleting, and updating Tags.
* Routes are mounted on path '/api/'
*
* Currently working endpoints:
* 	GET 	/api/tags
*	DELETE 	/api/tags/:tag
*	POST	/api/track/:id/tags
*	DELETE 	/api/track/:id/tag/:tag
*
* --------------------------------------------------------- */
(function (module) {

	'use strict';

	var router = require('express').Router(),
		logger = require('log4js').getLogger('api-tags'),
		util = require('util'),
		User = require ('../models/user.js'),
		Track = require ('../models/track.js');
	
	const ERR_MSG_NO_USERID = 'error: could not get user from request';

	/*
	* HTTP GET: gets all tags from a collection
	*
	* Returns an array of Strings.
	*/
	router.get('/tags', (req, res, next) => {
		let userId = getUserId(req);

		if (!userId) {
			return next(new Error(ERR_MSG_NO_USERID));
		}

		Track.find({ userId : userId })
			.distinct('tags')
			.exec()
			.then
			(
				results => res.send(results),
				error => next(err)
			)
			.catch(ex => next(ex));
	});

	/*
	* HTTP DELETE: removes a tag from all tracks where it is used
	*/
	router.delete('/tags/:tag', (req, res, next) => {

	})

	/*
	* HTTP POST: adds a set of a tags to the track's existing tags.
	* Data must be in the form { tags : ['tag1' , 'tag2' , 'tag3'] }
	*
	* Returns the modified Track object.
	*
	* TODO - this should really be PUT
	*/
	router.post('/track/:id/tags', (req, res, next) => {
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

	/*
	* HTTP DELETE: deletes a tag from a track
	*
	* Returns the modified Track object
	*/
	router.delete('/track/:id/tags/:tag', (req, res, next) => {
		let userId = getUserId(req);

		if (!userId) {
			return next(new Error(ERR_MSG_NO_USERID));
		}

		let trackId = req.params.id;
		let query = { tags : req.params.tag };
		
		Track.findOneAndUpdate
		(
			{ userId : userId, _id : trackId },
			{ $pull : query },
			{ new : true }
		)
		.exec()
		.then
		(
			data => res.send(data),
			err => next(err)
		);

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