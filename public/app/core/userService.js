(function () {

	'use strict';

	/*
	* Dummy implementation of a UserService
	*/
	function UserService($log, $http, UserModel, ytAuthService, scAuthService) {

		var UserService = {};
		var log = $log.getInstance('UserService');

		var thisUser = new UserModel('54302d72625533f01be231cb');
		
		// make these global constants
		var services = {
			yt : ytAuthService,
			sc : scAuthService
		}

		UserService.getCurrentUser = function() {
			return thisUser;			
		}

		UserService.login = function(username, password) {

		}

		UserService.logout = function() {
			
		}

		UserService.connect = function(serviceCode) {
			var service = services[serviceCode];

			if (service) {
				if (serviceCode === 'yt')
					return service.connect(false);
				else
					return service.connect();
			} else {
				log.warn('connect(): could not find service for serviceCode ' + serviceCode);
				return null;
			}


		}

		UserService.isAuthorized = function(serviceCode) {
			var service = services[serviceCode];

			if (service) return service.isReady();
			else log.warn('isAuthorized(): no service found for serviceCode ' + serviceCode)
		}

		return UserService;
	}

	angular
		.module('app.user', ['app.logEnhancer'])
		.factory('UserService', ['$log', '$http', 'UserModel', 'YTAuthService', 'SCAuthService', UserService]);
})();