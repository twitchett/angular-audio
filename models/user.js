var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var userSchema = new Schema({
    username : {
    	type: String,
    	unique: true,
    	required: true
    }
});

userSchema.statics.getUserId = function(username, callback) {
	this.find({ username: username }, callback);
}

module.exports = mongoose.model('User', userSchema);