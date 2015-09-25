(function () {

	'use strict';

	/*
	* Encapsulates all external interactions with YouTube.
	*/
	function YTAuthService($log, $http, $q, PROPERTIES) {
		// setup
		var YTAuthService 	= {},
			log 			= $log.getInstance('YTAuthService');

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

		// use immediate=true when checking first. if not authorized,
		// use immediate=false to trigger popup dialog
		var doAuth = function(immediate) {

			var q = $q.defer();

			// get settings from config 
			$http.get(PROPERTIES.CONFIGS).then(function(response) {
				var opts = 	{
					client_id 	: response.data.gapi.client_id,
					scope 		: response.data.gapi.scopes,
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
						log.warn('rejecting proise')
						q.reject(response);
					}	
				}); 
			});

			return q.promise;
		}
 
		// upon successful authorization, response will contain access token. "gapi" handles this for us.
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

	function YTAuthRun($window, $log, ytAuthService, PROPERTIES) {		
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

	angular
	 	.module('app.import.yt')
	 	.run(['$window', '$log', 'YTAuthService', 'PROPERTIES', YTAuthRun])
		.factory('YTAuthService', ['$log','$http', '$q', 'PROPERTIES', YTAuthService]);

})();