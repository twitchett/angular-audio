(function () {

	'use strict';

	/*
	* Encapsulates all external interactions with SoundCloud.
	*/
	function SCService($log, $http, $q, SC, scAuthService, trackFactory, CONST) {
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
			var selectionFn = function(model) {
				return (model) ? true : false;
			}
			return makeGetFavoritesRequest(selectionFn);
		}

		SCService.getNewFavourites = function() {
			var selectionFn = function(model) {
				return (model && model.getImportStatus() === 'none') ? true : false;
			}
			return makeGetFavoritesRequest(selectionFn);
		}

		// private methods
		function makeGetFavoritesRequest(selectionFn) {
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
				} else {
					var tracks = [];
					for (var i = 0; i < data.length; i++) {
						var model = convertToModel(data[i]);
						if (selectionFn(model)) tracks.push(model);
					}

					log.debug('getFavourites() got ' + tracks.length + ' items');
					d.resolve(tracks);
				}
			});

			return d.promise;
		}

		// converts JSON response from soundcloud to TrackModel object
		function convertToModel(data) {
			try {
				if (data.kind == 'track') {
					var trackData = {
						src 		: CONST.ORIGIN.SC,
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
		.factory('SCService', ['$log','$http', '$q', 'SC', 'SCAuthService', 'TrackFactory', 'CONST', SCService]);

})();