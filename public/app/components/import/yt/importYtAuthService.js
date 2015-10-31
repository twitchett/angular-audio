(function () {

	'use strict';

	/*
	* Responsible for OAuth2 authentication with YouTube.
	*/
	function YTAuthService($log, $http, $q, CONFIG) {
		// setup
		var YTAuthService 	= {},
			log 			= $log.getInstance('YTAuthService');

		// public methods

		YTAuthService.connect = function(immediate) {
			return doAuth(immediate);
		}

		YTAuthService.isReady = function() {
			return (gapi != null) && (gapi.client.youtube != null) && (gapi.auth.getToken() != null);
		}

		YTAuthService.disconnect = function() {
			gapi.auth.signOut();
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

			//console.warn('NOT AUTHORIZING GAPI');
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
 
		// upon successful authorization, response will contain access token. "gapi" saves this for us.
		var handleAuthResponse = function(response) {
			console.log('handling result', response);
			if (response && !response.error) {
				// success: nothing to do yet
			} else {
				console.log('gapi authorization error: ', response)
				// error: tell the controller
			}
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
		.factory('YTAuthService', ['$log','$http', '$q', 'CONFIG', YTAuthService]);

})();