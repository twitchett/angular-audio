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
		config = require('../config.json'),
		apiUtils = require('../apiUtils.js');

	/*
	* 
	*/
	router.get('/', (req, res, next) => {
		res.send(req.user[0]);
	});

	/*
	* 
	*/
	router.post('/accessToken', (req, res, next) => {
		let data = req.body;

		if (data && data.length) {
			let userId = apiUtils.getUserId(req);
			let service = data.service;
			let token = data.access_token;

			User.setAccessToken(service, token)
				.then
				(
					data => logger.info('token saved', data),
					err => logger.error('error saving token', err)
				);

		} else {
			return next(new Error('error: no data in request'));
		}
	})

	/*
	* 
	*/
	router.delete('/acessToken/:service', (req, res, next) => {
		if (req.params) {

			let service = req.params.service;

			if (!(service === 'sc' || service === 'yt')) {
				return next(new Error('error: unrecognised sevicecode parameter');
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

	module.exports = router;

})(module);