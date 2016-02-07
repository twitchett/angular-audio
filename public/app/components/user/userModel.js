(function () {

	'use strict';

	/*
	* Simple implementation of a user.
	* id corresponds to the user's id in the database.
	*/
	function UserModel(CONST) {

		var id, primaryToken, soundcloudToken, youtubeToken, email;

		var UserModel = function(data) {
			if (data) {

				// use util function

				this.id = data._id;
				this.primaryToken = data.primaryToken;
				this.youtubeToken = data.youtubeToken;
				this.soundcloudToken = data.soundcloudToken;
				this.email = data.email;	

			}
		}

		UserModel.prototype.getUserId = function() {
			return this.id;
		}

		UserModel.prototype.setAccessToken = function(serviceCode, token) {

			if (serviceCode === CONST.ORIGIN.SC) {
				this.soundcloudToken = token;
			} else if (serviceCode === CONST.ORIGIN.YT) {
				this.youtubeToken = token;
			}

			return this;
		}

		UserModel.prototype.getAccessToken = function(serviceCode) {

			if (serviceCode === CONST.ORIGIN.SC) {
				return this.soundcloudToken;
			} else if (serviceCode === CONST.ORIGIN.YT) {
				return this.youtubeToken;
			}

			return null;
		}

		return UserModel;
 
	}

	angular
		.module('app.user')
		.factory('UserModel', ['CONST', UserModel]);

})();