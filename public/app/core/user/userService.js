(function () {

	'use strict';

	/*
	* Dummy implementation of a UserService.
	* Designed to make external authorization easier but is this really needed?
	*/
	function UserService($log, $http, UserModel, ytAuthService, scAuthService, CONST) {

		var UserService = {};
		var log = $log.getInstance('UserService');

		var thisUser = new UserModel('54302d72625533f01be231cb');

		var yt = CONST.ORIGIN.YT,
			sc = CONST.ORIGIN.SC
		
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
				if (serviceCode === ORIGIN.YT)
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
		.module('app.user')
		.factory('UserService', ['$log', '$http', 'UserModel', 'YTAuthService', 'SCAuthService', 'CONST', UserService]);
})();