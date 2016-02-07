/* ---------------------------------------------------------/
*
* UserModel representing a MongoDB User document
*
* --------------------------------------------------------- */

(function (module) {

	'use strict'

	var mongoose = require('mongoose'),
		logger = require('log4js').getLogger('usermodel'),
		Schema = mongoose.Schema;

	var userSchema = new Schema({
		email: {
			type: 		String,
			unique: 	true,
			required: 	true
		},
		password: {
			type: 		String
		},
		primaryToken: {
			type: 		String,
			index: 		true
		},
		soundcloudToken: {
			type: 		String
		},
		youtubeToken: 	{
			type: 		String
		}
	});

	// if error or exception encountered, just log and continue/throw respectively
	userSchema.statics.findByToken = function(token) {
		return this.find({ primaryToken : token })
			.exec()
			.then(
				user => user,
				err => {
					logger.error('User.findByToken error', err);
					return err;
				}
			).catch(ex => {
				logger.error('User.findByToken exception', err);
				throw ex;
			});
	}

	userSchema.method.setAccessToken = function(type, token) {
		if (type === 'primary') {
			this.primaryToken = token;
		}
		if (type === 'sc') {
			this.soundcloudToken = token;
		}
		if (type === 'yt') {
			this.youtubeToken = token;
		}
		return this.save().exec();
	}

	// TODO: upgrade Mongoose to use accessToken as sub-document
	// Mongoose 2.4+ now supports 1-to-1 embedded documents
	var accessTokenSchema = new Schema({
		value: { 
			type: 		String,
	    	required: 	true
	    },
	    type: { 
			type: 		String, enum : ['yt', 'sc', 'aa'],
			required: 	true
		}
		// expiresAt : {
		// 	type 	: Date
		// }
	});

	module.exports = mongoose.model('User', userSchema);
	//module.exports = mongoose.model('AccessToken', accessTokenSchema);

})(module);