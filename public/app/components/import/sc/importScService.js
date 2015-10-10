(function () {

	'use strict';

	/*
	* Encapsulates all external interactions with SoundCloud.
	*/
	function SCService($log, $http, $q, SC, scAuthService, trackFactory) {
		// setup
		var SCService 	= {},
			log 		= $log.getInstance('SCService'),
			ready		= false,
			token 		= null; 	// oauth token

		var SC_STREAM_URL 	= '/tracks/', 			// needed?
			SC_FAVS_URL		= 'https://api.soundcloud.com/me/favorites.json?order=favourited_at',
			RESULTS_LIMIT 	= 200;

		// public methods
		SCService.getFavourites = function() {
			if (!scAuthService.isReady()) {
				log.debug('rejecting promise: no auth token (' + typeof self.token + ')');
				return $q.reject('user not authenticated');
			} 

			var d = $q.defer();
			
			var options = { 
				oauth_token	: scAuthService.getToken(),
				limit		: RESULTS_LIMIT
			}
			log.debug('making request to ' + SC_FAVS_URL + ' with options ', options);
			
			// TODO: pagination
			SC.get(SC_FAVS_URL, options, function(data, error) {
				if (error) {
					d.reject('error making request to ' + SC_FAVS_URL + ': ' + error);
					return d.promise;
				}

				var tracks = [];
				for (var i = 0; i < data.length; i++) {
					var model = convertToModel(data[i]);
					if (model) tracks.push(model);
				}

				log.debug('getFavourites() got ' + tracks.length + ' items');
				d.resolve(tracks);
			});

			return d.promise;
		}

		SCService.getNewFavourites = function() {
			if (!scAuthService.isReady()) {
				log.debug('rejecting promise: no auth token (' + typeof self.token + ')');
				return $q.reject('user not authenticated');
			} 

			var d = $q.defer();
			
			var options = { 
				oauth_token	: scAuthService.getToken(),
				limit		: RESULTS_LIMIT
			}
			log.debug('making request to ' + SC_FAVS_URL + ' with options ', options);
			
			// TODO: pagination
			SC.get(SC_FAVS_URL, options, function(data, error) {
				if (error) {
					d.reject('error making request to ' + SC_FAVS_URL + ': ' + error);
					return d.promise;
				}

				angular.forEach(data, function(item, idx) {
					var model = convertToModel(data[i]);
					if (model) {
						if (model.getImportStatus() === 'none') {
							return;
						}
						tracks.push(model);
					}
				});
	

				var tracks = [];
				for (var i = 0; i < data.length; i++) {

				}

				log.debug('getFavourites() got ' + tracks.length + ' items');
				d.resolve(tracks);
			});

			return d.promise;
		}

		// private methods

		// converts JSON response from soundcloud to TrackModel object
		function convertToModel(data) {
			try {
				if (data.kind == 'track') {
					var trackData = {
						src 		: 'sc',
						srcId		: data.id.toString(), 	// !!! we need this to be a String in TrackFactory.isExists() !!!
						name 		: data.title,
						duration	: SC.Helper.millisecondsToHMS(data.duration),
						genre		: data.genre,
						uploader	: data.user.username,
						stream_url 	: data.stream_url,
						img_url		: data.artwork_url,
						src_url 	: data.permalink_url,
						rating		: null,
						// ui-only attributes
						displayName: data.user.username + ' ' + data.title 
					}
					return trackFactory.createNew(trackData);
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

	angular
		.module('app.import.sc')
		.factory('SCService', ['$log','$http', '$q', 'SC', 'SCAuthService', 'TrackFactory', SCService]);

})();