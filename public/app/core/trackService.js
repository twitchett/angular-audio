(function () {

	'use strict';

	/*
	* Provides CRUD operations for Tracks. All interaction with the DB concerning Tracks goes through this service.
	* Methods accept & return TrackModel objects (with the exception of the create* methods, which take a JSON object)
	*/
	function TrackService($log, $http, userService, TrackModel) {

		var TrackService = {};
		var log = $log.getInstance('TrackService');

		var POST_TRACK_URL 		= '/api/track/',
			POST_TRACKS_URL 	= '/api/tracks',
			PUT_TRACK_URL		= '/api/track/:id',
			GET_LIB_URL			= '/api/library/',
			DELETE_TRACK_URL	= '/api/track/';

		// Creates a TrackModel object from the given json, but does not make a save (POST) request
		TrackService.createNew = function(data) {
			var track = new TrackModel(data);
			log.debug('created new track: ' + JSON.stringify(track, null, 4));
			return track;
		}

		// Creates a TrackModel object and makes a save (POST) request
		TrackService.createAndSaveNew = function(data) {
			var track = TrackService.createNew(data);
			return TrackService.save(track);
		}

		// POSTs the given TrackModel to the database
		TrackService.save = function(trackModel) {
			if (!trackModel) {
				log.warn('save failed, trackModel=' + typeof trackModel);
				return;
			}

			var postData = extendWithUserData(trackModel);

			var promise = $http.post(POST_TRACK_URL, postData)
				.then(function(response) {	// response: data, status, headers, config
					log.debug('saved track: ' + trackModel);
					return response.data;
				},
				function(response){
					log.debug('error saving track: ' + trackModel);
					return response.data
				});

			return promise;
		}

		// POSTs all the given TrackModels to the database. Expects an array of TrackModels.
		// Note: this is a batch operation
		TrackService.saveAll = function(trackModels) {
			if (!trackModels) {
				log.warn('saveAll failed, trackModels=' + typeof trackModels);
				return;
			}

			var postData = extendWithUserData({ tracks: TrackModels })

			var promise = $http.post(POST_TRACKS_URL, postData)
				.then(function(response) {
					log.debug('imported ' + response.data.length + ' tracks' );
				},
		 		function(response) {
					log.error('could not import tracks: ' + data);
		 		});

		 	return promise;
		}

		// Get all the tracks of the current user
		TrackService.getLibrary = function() {
			var userId = userService.getCurrentUser().getUserId();
			log.debug('getting library for user with id ' + userId);

			var promise = $http.get(GET_LIB_URL + userId)
				.then(function(response) {
					log.debug('got libary, tracks: ' + response.data.length);
					return response.data;
				},
		 		function(response) {
					log.error('error getting library for user ' + userId);
		 		});

		 	return promise;
		}

		// Removes all the TrackModels from the database. Expects an array of TrackModels.
		// Note: unlike saveAll, this is not a batch operation
		TrackService.deleteAll = function(trackModels) {
			if (!trackModels) {
				log.warn('deleteAll failed, trackModels=' + trackModels);
				return;
			}

			// Do not extend with userData here

			log.debug('deleting ' + trackModels.length + ' tracks');

			for (var i=0; i<trackModels.length; i++) {
				var trackId = trackModels[i].getId();

				if (trackId != null) {
					$http.get(DELETE_TRACK_URL + trackId)
						.then(function(response) {
							log.debug(response.data);
						},
				 		function(response) {
							log.error('error deleting track ' + trackId);
				 		});

				} else {
					log.warn('could not delete track ' + trackModels[i].name + ': no _id found');
				}
			}
		}

		// TODO: would be better as a server-side interceptor
		function extendWithUserData(data) {
			var id = userService.getCurrentUser().getUserId();
			var newData = angular.extend(data,
				{
					userId : id
				}
			);
			return newData;
		}

		return TrackService;
	}

	angular
		.module('app')
		.factory('TrackService', ['$log', '$http', 'UserService', 'TrackModel', TrackService]);

})();