(function () {

	'use strict';

	/*
	* Handles authorization with SoundCloud. 
	*/
	function SCAuthService($log, $http, $q, SC, userService, CONFIG, CONST) {

		// setup
		var SCAuthService 	= {},
			log 			= $log.getInstance('SCAuthService'),
			ready			= false;

		SCAuthService.connect = function() {
			var d = $q.defer();

			var connectCallback = function connectCallback(data) {
				$http.get(CONFIG.sc.token_url).then(function(response) {

					log.debug('got OAuth token for user ', data);

					/*
					* NOTE: we do not need to call userService.saveAccessToken('sc') here.
					* This is because the token is obtained via a call to SC from the back end,
					* so is already saved to the db.
					*
					* But we do need to save it to the front end usermodel.
					*/

					userService.getCurrentUser().setAccessToken(CONST.ORIGIN.SC, response.data)

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
			return SC.isConnected();
		}

		SCAuthService.getToken = function() {
			return SC.accessToken();
		}

		SCAuthService.disconnect = function() {
			SC.disconnect();
			userService.removeAccessToken(CONST.ORIGIN.SC);
		}

		return SCAuthService;
	}

	function SCAuthRun($log, SC, userService, CONFIG, CONST) {

		// SC is the SoundCloud javascript client helper
		// see https://developers.soundcloud.com/docs/api/sdks#javascript
		if (SC) { 

			SC.initialize({
				client_id		: CONFIG.sc.client_id,
			 	redirect_uri	: CONFIG.sc.redirect_uri
			});

			var sc_token = userService.getCurrentUser().getAccessToken(CONST.ORIGIN.SC);

			if (sc_token) {
				SC.accessToken(sc_token);	
			}

		} else {
			$log.error('SC object not found on page. Cannot connect to SoundCloud.');
		}
	}

	angular
		.module('app.import.sc')
		.run(['$log', 'SC', 'UserService', 'CONFIG', 'CONST', SCAuthRun])
		.factory('SCAuthService', ['$log', '$http', '$q', 'SC', 'UserService', 'CONFIG', 'CONST', SCAuthService]);

})();