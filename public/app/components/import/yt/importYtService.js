(function () {

	'use strict';

	/*
	* Encapsulates all external interactions with YouTube.
	* Responsibility: to make requests to youtube and return TrackModels or playlist data
	*/
	function YTService($log, $http, $q, ytAuthService, trackFactory, PROPERTIES) {
		
		var YTService 	= {},
			log 		= $log.getInstance('YTService');

		var pageSize 	= 50; 	// number of results to return in API requests (default is 5, max is 50)

		var VIDEO_URL 	= "https://www.youtube.com/watch?v=",
			LIST_PARAM	= "&list="

		/*
		* Gets all playlists belonging to the user (no videos, only playlist names)
		*/
		YTService.getPlaylists = function() {
			var playlists = [];				// results-array
			var options = {
				mine 		: 'true',  		// all playlists of logged-in user
				part 		: 'snippet', 	// return "snippet" data (title, desc, etc)
				maxResults  : pageSize		
			}

			// the executable request
			var request = gapi.client.youtube.playlists.list(options);
			
			// returns a promise
			return getAllPlaylists(request, options, playlists);
		}

		/* 
		* Gets all videos in a single playlist
		*/
		YTService.getPlaylist = function(playlistId) {
			var videos = [];
			var options = {
				playlistId 	: playlistId,
				part 		: 'snippet', 	// return "snippet" data (title, desc, etc)
				maxResults 	: pageSize
			}

			// the executable request
			var request = gapi.client.youtube.playlistItems.list(options);

			console.log(request);
			
			// returns a promise
			return getPlaylistItems(request, options, videos);
		}

		/*
		* This method recursively calls the API until all playlists have been retrieved.
		* The calls have to be in sequence because each response contains a code to retrieve the next page. No parallization here...
		*/
		var getAllPlaylists = function(request, options, results, count, limit) {
			log.debug('makign request, num results=' + results.length + ' options ', options);
	
			return request.then(function(response) {

				var nextPageToken = response.result.nextPageToken;
				var items = response.result.items;

				for (var i = 0; i < items.length; i++) {
					results.push(convertPlaylist(items[i]));
				}

				if (nextPageToken) {
					options.pageToken = nextPageToken;
					var newRequest 	= gapi.client.youtube.playlists.list(options);

					return getAllPlaylists(newRequest, options, results);

				} else {
					log.debug('retrieved ' + results.length + ' playlists');
					return results;
				}
			},
			errorHandler);
		}

		/*
		* Recursively gets all videos.
		*/
		var getPlaylistItems = function(request, options, results, count, limit) {	
			log.debug('getPlaylistItems() request, num results=' + results.length + ' options ', options);
			return request.then(function(response) {

				var nextPageToken = response.result.nextPageToken;
				var items = response.result.items;

				for (var i = 0; i < items.length; i++) {

					var trackModel = convertToTrackModel(items[i]);			
					if (trackModel) results.push(trackModel);
				}

				if (nextPageToken) {
					options.pageToken = nextPageToken;
					var newRequest 	= gapi.client.youtube.playlistItems.list(options);

					return getPlaylistItems(newRequest, options, results);

				} else {
					console.log('returning with ' + results.length);
					return results;
				}
			},
			errorHandler);
		}

		// private methods

		// Convert JSON playlist response to playlist object
		var convertPlaylist = function(data) {
			return {
				id 			: data.id,
				title 		: data.snippet.title,
				description : data.snippet.description,
				date 		: data.snippet.publishedAt
			}
		}

		// converts JSON response from YouTube to TrackModel object
		var	convertToTrackModel = function(data) {
			console.log('converting video ' , data);

			if (!isUnavailable(data)) {
				try {
					var trackData = {
						src 		: 'yt',
						srcId 		: data.snippet.resourceId.videoId,
						name 		: data.snippet.title,
						description : data.snippet.description,
						img_url 	: data.snippet.thumbnails.default.url,
						uploader 	: data.snippet.channelTitle,
						// ui-only attributes
						displayName : data.snippet.title, 
					}

					var trackModel = trackFactory.createNew(trackData);

					// add import-only attributes
					return augmentProperties(trackModel, data);

				} catch (error) {
					log.error('convert to model error ', error);
					log.debug('convertToModel failed for: ' + JSON.stringify(data, null, 4));
				}
			} else {
				log.warn('Video private/unavailable')
			}
		}

		var augmentProperties = function(trackModel, data) {

			// add a function that returns a link to this video in its playlist
			trackModel.getViewInPlaylistUrl = function() {
				return this.getSrcUrl() + LIST_PARAM + data.snippet.playlistId;
			}

			return trackModel;
		}

		// check if the video has been made private/unavailable
		var isUnavailable = function(data) {
			
			// TODO: temporary method - this is not a reliable way of checking

			var private_title = "Private video";
			var private_description = "This video is private.";
			var deleted_title = "Deleted video";
			var deletec_description = "This video is unavailable.";

			return (((private_title.localeCompare(data.snippet.title) === 0) 
				&& (private_description.localeCompare(data.snippet.description) === 0)))
			|| (((deleted_title.localeCompare(data.snippet.title) === 0) 
				&& (deletec_description.localeCompare(data.snippet.description) === 0)));
		}

		var errorHandler = function(response) {
			log.error('error making API call! ', response);

			if (response.status == 403) {
				// we probably need to doAuth();
			}
		}

		return YTService;

	}

	angular
	 	.module('app.import.yt')
		.factory('YTService', ['$log','$http', '$q', 'YTAuthService', 'TrackFactory', 'PROPERTIES', YTService]);

})();