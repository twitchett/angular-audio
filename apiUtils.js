/* ---------------------------------------------------------/
*
* General helper functions for the back end app
*
* --------------------------------------------------------- */
(function (module) {

	'use strict';

	var logger = require('log4js').getLogger('api-tags');

	var utils = {
		msgs : {}
	};
	
	/*
	* 
	*/
	utils.msgs.ERR_MSG_NO_USERID = 'error: could not get user from request';

	/*
	* Extracts the user Id from the request object
	*/
	utils.getUserId = function getUserId(req) {
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

	module.exports = utils;

})(module);