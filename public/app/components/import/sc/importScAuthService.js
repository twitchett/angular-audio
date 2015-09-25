(function () {

	'use strict';

	/*
	* Handles authorization with SoundCloud. 
	*/
	function SCAuthService($log, $http, $q, SC) {

		// setup
		var SCAuthService 	= {},
			log 			= $log.getInstance('SCAuthService'),
			ready			= false,
			token 			= null; 	// oauth token

		var OA_TOKEN_URL 	= '/sc/getOAToken';

		// public methods

		SCAuthService.connect = function() {
			var q1 = $q.defer();

			SC.connect(function(data) {

				$http.get(OA_TOKEN_URL).then(function(response) {
					log.debug('got OAuth token for user ');
					token = response.data;
					q1.resolve();
				},
				function(error) {
					q1.reject('could not get OAuth token');
				});

			});

			return q1.promise;
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

		// private methods

		return SCAuthService;
	}

	function SCAuthRun($log, $http, SC, PROPERTIES) {
		if (SC) {
			// client id & redirect uri held in properties file (temporary implementation)
			$http.get(PROPERTIES.CONFIGS).then(function(response) {
				var sc_client_id = response.data.sc.client_id;
				var sc_redirect_uri = response.data.sc.redirect_uri;
				SC.initialize({
					client_id		: sc_client_id,
				 	redirect_uri	: sc_redirect_uri
				});
			})
		} else {
			$log.error('SC object not found on page. Cannot connect to SoundCloud.');
		}
	}

	angular
		.module('app.import.sc')
		.run(['$log', '$http', 'SC', 'PROPERTIES', SCAuthRun])
		.factory('SCAuthService', ['$log','$http', '$q', 'SC', SCAuthService]);

})();