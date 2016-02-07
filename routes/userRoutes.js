/* ---------------------------------------------------------/
*
*
* Paths:
*	GET 	/user
* 	POST 	/user/accessToken
*	DELETE  /user/accessToken/:service
*
* --------------------------------------------------------- */

(function (module) {

	'use strict'

	var router = require('express').Router(),
		https = require('https'),
		User = require ('../models/user.js'),
		logger = require('log4js').getLogger('userApi'),
		config = require('../config.json');

	/*
	* 
	*/
	router.get('/', (req, res) => {
		res.send(req.user[0]);
	});

	/*
	* 
	*/
	router.post('/accessToken', (req, res) => {
		let data = req.body;

		if (data && data.length) {
			let userId = getUserId(req);
			let service = data.service;
			let token = data.access_token;

			User.setAccessToken(service, token)
				.then(
					data => logger.info('token saved', data),
					err => logger.error('error saving token', err)
				);

		} else {
			res.status(400).send('error: no data in request');
		}
	})

	/*
	* 
	*/
	router.delete('/acessToken/:service', (req, res) => {
		if (req.params) {

			let service = req.params.service;

			if (!(service === 'sc' || service === 'yt')) {
				// throw a wobble
				res.status(400).send('error: unrecognised sevicecode parameter');
			}

			User.setAccessToken(service, null).then(
				data =>
				{
					logger.info('token deleted', data);
					res.send(true);
				}, 
				err => 
				{
					logger.error('error deleting token', err)
					res.send(false);
				})
		}

	})

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