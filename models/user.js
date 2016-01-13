var mongoose = require('mongoose'),
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
	// temporarily using soundcloud token for primary authentication
	primaryToken: {
		type: 		String,
		index: 		true
	},
	// not currently used
	soundcloudToken: {
		type: 		String
	},
	// not currently used
	youtubeToken: 	{
		type: 		String
	}
});

userSchema.statics.findByToken = function(token, callback) {
	this.find({ primaryToken : token }, callback);
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