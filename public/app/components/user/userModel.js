(function () {

	'use strict';

	/*
	* Simple implementation of a user.
	* id corresponds to the user's id in the database.
	*/
	function UserModel() {

		var UserModel = function(id) {
			this.userId = id;
		}

		UserModel.prototype.getUserId = function() {
			return this.userId;
		}

		return UserModel;
 
	}

	angular
		.module('app.user')
		.factory('UserModel', [UserModel]);

})();