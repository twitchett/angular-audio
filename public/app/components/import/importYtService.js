(function () {

	'use strict';

	/*
	* Encapsulates all external interactions with YouTube.
	*/
	function YTService($log, $http, $q, ytAuthService, trackService, PROPERTIES) {
		// setup
		var YTService 	= {},
			log 		= $log.getInstance('YTService');

		var pageSize 	= 50; 	// number of results to return in API requests (default is 5, max is 50)

		YTService.getPlaylists = function() {
			var playlists = [];
			var options = {
				mine 		: 'true',  		// all "my" playlists
				part 		: 'snippet', 	// return "snippet" data (title, desc, etc)
				maxResults  : pageSize		
			}

			// the executable request
			var request = gapi.client.youtube.playlists.list(options);
			
			return getAllPlaylists(request, options, playlists);
		}


		YTService.getPlaylist = function(playlistId) {
			console.log('ytAuthService.isReady' + ytAuthService.isReady())
			var videos = [];
			var options = {
				playlistId 	: 'PLvQEooGTapii34T8hcaW0sRcGAGwxui_P',
				part 		: 'snippet', 	// return "snippet" data (title, desc, etc)
				maxResults 	: 5		
			}

			// the executable request
			var request = gapi.client.youtube.playlistItems.list(options);

			console.log(request);
			
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
					console.log('returning with ' + results.length);
					return results;
				}
			},
			errorHandler);
		}

		/*
		* Recursively gets all videos.
		*/
		var getPlaylistItems = function(request, options, results, count, limit) {	
			return request.then(function(response) {

				var nextPageToken = response.result.nextPageToken;
				var items = response.result.items;

				for (var i = 0; i < items.length; i++) {
					results.push(convertToTrackModel(items[i]));
				}

				if (nextPageToken) {
					options.pageToken = nextPageToken;
					var newRequest 	= gapi.client.youtube.playlistItems.list(options);

					return getAllPlaylists(newRequest, options, results);

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
			console.log(data);

			try {
				var trackData = {
					src 		: 'yt',
					srcId 		: data.snippet.resourceId.videoId,
					name 		: data.snippet.title,
					img_url 	: data.snippet.thumbnails.default.url,
					uploader 	: data.snippet.channelTitle,
					// ui-only attributes
					displayName : data.snippet.title, 
				}

				return trackService.createNew(trackData);

			} catch (error) {
				log.error('convert to model error ', error);
				log.debug('convertToModel failed for: ' + JSON.stringify(data, null, 4));
			}
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
	 	.module('app.import.yt', ['app.logEnhancer'])
		.factory('YTService', ['$log','$http', '$q', 'YTAuthService', 'TrackService', 'PROPERTIES', YTService]);

})();