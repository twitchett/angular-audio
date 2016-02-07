(function () {

	'use strict';

	/*
	* Dummy implementation of a UserService.
	* Designed to make external authorization easier but is this really needed?
	*/
	function UserService($log, $http, UserModel, CONST) {

		var UserService = {};
		var log = $log.getInstance('UserService');
		var currentUser = null;

		var yt = CONST.ORIGIN.YT, sc = CONST.ORIGIN.SC;
		
		var ACCESS_TOKEN_URL = '/user/accessToken';

		UserService.getCurrentUser = function getCurrentUser() {
			return this.currentUser;			
		}

		UserService.setCurrentUser = function setUser(user) {
			this.currentUser = user;
		}

		UserService.saveAccessToken = function setAccessToken(serviceCode, token) {

			var postData = {
				service : serviceCode,
				access_token : token
			}

			return $http.post(ACCESS_TOKEN_URL, postData)
				.then(function(response)
				{	
					log.debug('save token response: ' + response);

					// should we really set the token here? then it exists in 3 places!
					return currentuser.setAccessToken(serviceCode, token);
				},
				function(response){
					log.debug('save token error: ' , response);
					return response.data;
				});
		}

		UserService.removeAccessToken = function removeAccessToken(serviceCode) {
			var url = ACCESS_TOKEN_URL + '/' + serviceCode;

			return $http.delete(url)
				.then(function(response)
				{	
					log.debug('delete token response: ' + response);
					return currentuser.setAccessToken(serviceCode, null);
				},
				function(response)
				{
					log.debug('delete token error: ' , response);
					return response.data;
				});
		}

		return UserService;
	}

	function UserServiceRun(userService, UserModel, UserData) {

		var userModel;
		
		if (UserData) {
			// userData is obtained during manual bootstrapping and converted to UserModel here. bit iffy...
			userModel = new UserModel(UserData)
		} else {
			// create anon user (TODO)
			userModel = new UserModel({ _id: 'anon'})
		}

		userService.setCurrentUser(userModel);
		angular.module('app').value('UserData', null);
	}

	angular
		.module('app.user')
		.run(['UserService', 'UserModel', 'UserData', UserServiceRun])
		.factory('UserService', ['$log', '$http', 'UserModel', 'CONST', UserService]);
})();