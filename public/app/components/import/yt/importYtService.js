(function () {

	'use strict';

	/*
	* Encapsulates all external interactions with YouTube.
	* Responsibility: to make requests to youtube and return valid TrackModels or playlist data
	*/
	function YTService($log, $http, $q, ytAuthService, trackFactory, CONST) {
		
		var YTService 	= {},
			log 		= $log.getInstance('YTService');

		var pageSize 	= 10; 	// number of results to return in API requests (default is 5, max is 50)

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

			var requestFn = gapi.client.youtube.playlists.list;
			
			// returns a promise
			return fetchResults(requestFn, options, playlists, convertPlaylist);
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
			var requestFn = gapi.client.youtube.playlistItems.list;
			
			// returns a promise
			return fetchResults(requestFn, options, videos, convertTrack);
		}

		/*
		* This method recursively calls requestFn until all data has been retrieved.
		* Each response contains a code (nextPageToken) to retrieve the next page.
		*/
		var fetchResults = function(requestFn, options, results, conversionFn, count, limit) {
			log.debug('makign request, num results=' + results.length + ' options ', options);

			// this is the success handler to requestFn (which makes the external call)
			var fetchNextPage = function(response) {
				var nextPageToken = response.result.nextPageToken;
				var items = response.result.items;

				angular.forEach(items, function(item) {
					results.push(conversionFn(item));
				});

				// if nextPageToken exists, make another call
				if (nextPageToken) {
					options.pageToken = nextPageToken;

					return fetchResults(requestFn, options, results, conversionFn);

				// if there is no nextPageToken, we have all the results: return the array
				} else {
					log.debug('retrieved ' + results.length + ' items');
					return results;
				}
			}
	
			return requestFn(options).then(fetchNextPage, errorHandler);
		}

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
		var	convertTrack = function(data) {
			console.log('converting video ' , data);

			if (!isUnavailable(data)) {
				try {
					var trackData = {
						src 		: CONST.ORIGIN.YT,
						srcId 		: data.snippet.resourceId.videoId,
						name 		: data.snippet.title,
						description : data.snippet.description,
						img_url 	: data.snippet.thumbnails.default.url,
						uploader 	: data.snippet.channelTitle,
						// ui-only attributes
						displayName : data.snippet.title, 
					}

					var trackModel = trackFactory.createNew(trackData);

					console.log('new trackmodel', trackModel);

					// add import-only attributes
					return setImportAttributes(trackModel, data);

				} catch (error) {
					log.error('convert to model error ', error);
					log.debug('convertToModel failed for: ' + JSON.stringify(data, null, 4));
				}
			} else {
				log.warn('Video private/unavailable')
			}
		}

		var setImportAttributes = function(trackModel, data) {

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
				// TODO auth prompt
			}
		}

		return YTService;

	}

	angular
	 	.module('app.import.yt')
		.factory('YTService', ['$log','$http', '$q', 'YTAuthService', 'TrackFactory', 'CONST', YTService]);

})();