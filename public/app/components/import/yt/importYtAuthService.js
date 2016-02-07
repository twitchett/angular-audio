(function () {

	'use strict';

	/*
	* Responsible for OAuth2 authentication with YouTube.
	*/
	function YTAuthService($log, $http, $q, userService, CONFIG, CONST) {
		
		// setup
		var YTAuthService 	= {},
			log 			= $log.getInstance('YTAuthService');

		// public methods

		YTAuthService.connect = function(immediate) {

			return doAuth(immediate).then(function(response) {

				if (isBearerToken(response)) {
					userService.saveAccessToken(CONST.ORIGIN.YT, response.access_token);
				}

				return true;

			}, function(err) {

				// if there was a problem with immediate=true, try again with immediate=false (this triggers dialog)
				if (immediate) {
					return doAuth(false);
				} else {
					return err;
				}

			});
		}

		YTAuthService.isReady = function() {
			return (gapi != null) && (gapi.client.youtube != null) && (gapi.auth.getToken() != null);
		}

		YTAuthService.disconnect = function() {
			gapi.auth.signOut();
			userService.removeAccessToken(CONST.ORIGIN.YT);
		}

		// private methods

		// use immediate=true to check if user already authorized (no popup prompt)
		// if not authorized, use immediate=false to trigger popup dialog
		var doAuth = function(immediate) {
			var q = $q.defer();

			var opts = 	{
				client_id 	: CONFIG.gapi.client_id,
				scope 		: CONFIG.gapi.scopes,
				immediate	: immediate
			}

			log.debug('authorizing with opts ', opts);

			gapi.auth.authorize(opts, function(response) {
				console.log('in callback function, response is ', response)

				if (response && !response.error) {
					log.info('resolving promise')
					q.resolve(response);
				} else {
					log.warn('rejecting proise', promise)
					q.reject(response);
				}	
			}); 

			return q.promise;
		}

		var isBearerToken = function(response) {
			return (response && response.acess_token && response.token_type === 'Bearer');
		}

		return YTAuthService;

	}

	function YTAuthRun($window, $log, ytAuthService) {		
		var log = $log.getInstance('YTAuthRun');

		// this function needs to be available on the page when the google api script loads
		$window.gapiInit = function() {

			// load the youtube API so we can make calls using gapi.client.youtube
			gapi.client.load('youtube','v3', function() {
				log.debug('Youtube client ready');
			});

			// authorize if possible
			ytAuthService.connect(true);
		};

		// this is pretty gross
		var head	= document.getElementsByTagName('head')[0];
		var script	= document.createElement('script');
		script.type = 'text/javascript';
		script.src 	= 'https://apis.google.com/js/client.js?onload=gapiInit';
		head.appendChild(script);
	}

	/*
	* angular module configuration
	*/
	angular
	 	.module('app.import.yt')
	 	.run(['$window', '$log', 'YTAuthService', YTAuthRun])
		.factory('YTAuthService', ['$log','$http', '$q', 'UserService', 'CONFIG', 'CONST', YTAuthService]);

})();