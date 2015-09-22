(function () {

	'use strict';

	/*
	* Encapsulates all external interactions with SoundCloud.
	*/
	function SCService($log, $http, $q, SC, trackService) {

		// setup
		var SCService 	= {},
			log 		= $log.getInstance('SCService'),
			ready		= false,
			token 		= null; 	// oauth token

		var OA_TOKEN_URL 	= '/sc/getOAToken',
			SC_STREAM_URL 	= '/tracks/', 			// needed?
			SC_FAVS_URL		= 'https://api.soundcloud.com/me/favorites.json?order=favourited_at',
			RESULTS_LIMIT 	= 200;

		// public methods

		SCService.connect = function() {
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


		SCService.getFavourites = function() {
			var q = $q.defer();

			if (!token) {
				log.debug('rejecting promise: no auth token (' + typeof self.token + ')');
				var rejection = q.reject('user not authenticated');
				return q.promise;
			} 

			var options = { 
				oauth_token	: token,
				limit		: RESULTS_LIMIT
			}
			log.debug('making request to ' + SC_FAVS_URL + ' with options ', options);
			
			// TODO: pagination
			SC.get(SC_FAVS_URL, options, function(data, error) {
				if (error) {
					q.reject('error making request to ' + SC_FAVS_URL + ': ' + error);
					return q.promise;
				}

				var tracks = [];
				for (var i = 0; i < data.length; i++) {
					var model = convertToModel(data[i]);
					if (model) tracks.push(model);
				}

				log.debug('getFavourites() got ' + tracks.length + ' items');
				q.resolve(tracks);
			});

			return q.promise;
		}

		SCService.isConnected = function() {
			return (token != null);
		}

		SCService.disconnect = function() {
			token = null;
		}

		// private methods

		// converts JSON response from soundcloud to TrackModel object
		function convertToModel(data) {
			try {
				if (data.kind == 'track') {
					var trackData = {
						src 		: 'sc',
						srcId		: data.id,
						name 		: data.title,
						duration	: SC.Helper.millisecondsToHMS(data.duration),
						genre		: data.genre,
						uploader	: data.user.username,
						stream_url 	: data.stream_url,
						img_url		: data.artwork_url,
						rating		: null,
						// ui-only attributes
						displayName: data.user.username + ' ' + data.title 
					}
					return trackService.createNew(trackData);
				} else {
					log.warn(data.kind + ' not converted. only soundcloud tracks are currently supported.');
				}
			} catch (error) {
				log.error('error converting track to model: ' + error);
			}
			return null;
		};

		return SCService;
	}

	function SCRun($log, $http, SoundCloud, PROPERTIES, SCService) {
		if (SoundCloud) {
			// client id & redirect uri held in properties file (temporary implementation)
			$http.get(PROPERTIES.CONFIGS).then(function(response) {
				var sc_client_id = response.data.sc.client_id;
				var sc_redirect_uri = response.data.sc.redirect_uri;
				SoundCloud.initialize({
					client_id		: sc_client_id,
				 	redirect_uri	: sc_redirect_uri
				});
			})
		} else {
			$log.error('SC object not found on page. Cannot connect to SoundCloud.');
		}
	}

	angular
		.module('app.import')
		.run(['$log', '$http', 'SC', 'PROPERTIES', 'SCService', SCRun])
		.factory('SCService', ['$log','$http', '$q', 'SC', 'TrackService', SCService]);

})();