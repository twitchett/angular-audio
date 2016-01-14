(function () {

	'use strict';

	/*
	* Handles authorization with SoundCloud. 
	*/
	function SCAuthService($log, $http, $q, SC, CONFIG) {

		// setup
		var SCAuthService 	= {},
			log 			= $log.getInstance('SCAuthService'),
			ready			= false,
			token 			= null; 	// oauth token

		SCAuthService.connect = function() {
			var d = $q.defer();

			var connectCallback = function connectCallback(data) {
				$http.get(CONFIG.sc.token_url).then(function(response) {
					log.debug('got OAuth token for user ');
					token = response.data;
					d.resolve();
				},
				function(error) {
					d.reject('could not get OAuth token');
				});

			}

			SC.connect(connectCallback);
			
			return d.promise;
		};

		SCAuthService.isReady = function() {
			return (token != null);
		}

		SCAuthService.getToken = function() {
			return token;
		}

		SCAuthService.disconnect = function() {
			token = null; 
		}

		return SCAuthService;
	}

	function SCAuthRun($log, SC, CONFIG) {

		// SC is the SoundCloud javascript client helper
		// see https://developers.soundcloud.com/docs/api/sdks#javascript
		if (SC) { 
			SC.initialize({
				client_id		: CONFIG.sc.client_id,
			 	redirect_uri	: CONFIG.sc.redirect_uri
			});
		} else {
			$log.error('SC object not found on page. Cannot connect to SoundCloud.');
		}
	}

	angular
		.module('app.import.sc')
		.run(['$log', 'SC', 'CONFIG', SCAuthRun])
		.factory('SCAuthService', ['$log','$http', '$q', 'SC', 'CONFIG', SCAuthService]);

})();