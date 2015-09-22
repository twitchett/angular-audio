(function () {

	'use strict';

	/*
	* Dummy implementation of a UserService
	*/
	function UserService($log, $http, UserModel) {

		var UserService = {};
		var log = $log.getInstance('UserService');

		var thisUser = new UserModel('54302d72625533f01be231cb');
		

		UserService.getCurrentUser = function() {
			return thisUser;			
		}

		UserService.login = function(username, password) {

		}

		UserService.logout = function() {
			
		}

		return UserService;
	}

	angular
		.module('app')
		.factory('UserService', ['$log', '$http', 'UserModel', UserService]);
})();