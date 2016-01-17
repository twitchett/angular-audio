/* ---------------------------------------------------------/
*
* TrackModel representing a MongoDB Track document
*
* --------------------------------------------------------- */

(function (module) {

	'use strict'

	var mongoose = require('mongoose'),
		Schema = mongoose.Schema;

	var trackSchema = new Schema({
		userId : {
			type: 		Schema.Types.ObjectId,
			ref: 		'User',
			index:		true,
			required: 	true
		},
		date_added:		{ type: Date, default: Date.now },
		src: { 
			type: 		String, enum : ['yt', 'sc', 'na'],
			required: 	true
		},
		inLibrary: 		Boolean, 
		ghost: 			{ type: Boolean, default: false },

		// properties from the source
		
		// sc IDs are a 9-character length string 0-9
		// yt IDs are an 11-character length string of a-z, A-Z, 0-9, - and _
		srcId: 			{ type: String,	unique: true, sparse: true },
		name: 			String,
		duration: 		String,
		uploader: 		String,
		img_url: 		String,

		// sc specific properties
		stream_url: 	String,

		// yt specific properties
		// none

		// user specific properties
		rating: 		Number,
		title: 			String,
		artist: 		String,
		label: 			String,
		tags: 			[String],
		playlistIds: 	[String]
	});

	trackSchema.statics.findByUserId = function (id) {
		return this.find({ userId: id}).exec();
	}

	module.exports = mongoose.model('Track', trackSchema);

})(module);