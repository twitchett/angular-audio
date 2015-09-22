var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var playlistSchema = new Schema({
	ownerId : {
		type: Schema.Types.ObjectId,
		ref: 'User',
		index: true,
		required: true
	},

	name : String,
	tracks : {
		type: [Schema.Types.ObjectId]
	}, 	
	users : {
		// array of?
		// userId : {
		// 	type: Schema.Types.ObjectId,
		// 	ref: 'User',
		// 	index: true,
		// 	required: true
		// }
	},
	dateCreated : { type: Date, default: Date.now },
	dateUpdated : { type: Date, default: Date.now }
	privacy : {
		type: String, enum : ['private', 'contributor', 'public'],
		required: true
	}
});

module.exports = mongoose.model('Playlist', playlistSchema);