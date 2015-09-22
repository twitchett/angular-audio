(function () {

	'use strict';

	/*
	* Encapsulates all external interactions with YouTube.
	*/
	function YTService($log, $http, $q, gapi, trackService) {

		// setup
		var YTService 	= {},
			log 		= $log.getInstance('YTService');

		var ready = false;

		// converts JSON response from YouTube to TrackModel object
		var	convertToModel = function(data) {
			console.log(data);

			try {
				var trackData = {
					src 		: 'yt',
					srcId 		: data.snippet.resourceId.videoId,
					name 		: data.snippet.title,
					img_url 	: data.snippet.thumbnails.default.url,
					uploader 	: data.snippet.channelTitle,
					// ui-only attributes
					displayName : data.snippet.title, // TODO: move this logic into View or Model?
				}

				console.log('from yt ', track);
				return trackService.createNew(trackData);

			} catch (error) {
				log.debug('convertToModel failed for: ' + JSON.stringify(data, null, 4));
			}
		}


		// init is called as a callback function from loading the script
		// this is defined in the script include tag in the index.html!
		YTService.gapiInit = function () {
			console.log('gapiInit');
			gapi.client.setApiKey(my_api_key);
			gapi.client.load('youtube','v3', function() {
				ready = true;
				console.log('youtube client ready');
			});
		}

		YTService.isReady = function() {
			return ready;
		},

		YTService.beginAuth = function() {
			if (!this.isReady()) gapi.client.setApiKey(_this.api_key);
			console.log('show window');
			window.setTimeout(this.checkAuth, 1);
		}, 

		YTService.checkAuth = function() {
			console.log('check auth')
			var opts = {
				client_id: my_client_id,
				scope: scopes, 
				immediate: true
			}
			console.log('with opts ', opts);
			gapi.auth.authorize(opts,
			this.handleAuthResult); 
		},

		YTService.handleAuthResult = function(authResult) {
			console.log('handling result');
			var authButton = document.getElementById('yt-authorization-button');
			if (authResult && !authResult.error) {
				authButton.style.visibility = 'hidden';
				console.log('did we win? ', authResult);
			} else {
				authButton.style.visibility = '';
				authButton.onClick = handleAuthClick;
			}
		},

		YTService.handleAuthClick = function(event) {
			gapi.auth.authorize({
				client_id: my_client_id,
				scope: scopes, 
				immediate: true
			},
			this.handleAuthResult); 
		},

		YTService.getFavourites = function(callback) {
			if (!this.isReady()) {
				callback(true, null); // haha
				console.log('getPlaylist: youtube client not initialized');
				return;
			} 

			console.log('getting some playlist')
			var options = {
				playlistId: 'PLvQEooGTapii718b3zwWLLRDL9KjsXDsO',
				part: 'snippet',
			}

			var request = gapi.client.youtube.playlistItems.list(options);
			request.execute(function(response) {
				console.log('got response with items: ', response.result);
				var list = response.result.items;
				var tracks = [];
				for (var i = 0; i < list.length; i++) {
					testItem = list[i];
					tracks.push(convertToModel(list[i]));
				}
				console.log('App.Clients.YT.getPlaylist got ' + list.length + ' items');
				callback(null, tracks);
			});
		}

		// set public function that is called by the google API - really yucky


		return YTService;

	}

	function YTRun($window, log) {
		console.log('in YT run');

		var my_client_id 	= '616811247378-j28985c6aqsnvi2rrhiso94oma3m24eb.apps.googleusercontent.com';
		var scopes 			= 'https://www.googleapis.com/youtube';

		$window.gapiInit = function() {
			console.log('gapiInit called');
			gapi.client.setApiKey('AIzaSyCvTViVdk5VUvkLSg38PLlsfN7vC6xYdBg');
			console.log('api key set');

			//$window.setTimeout($window.checkAuth, 1);
			console.log('set timeout?')
			// gapi.client.load('youtube','v3', function() {
			// 	ready = true;
			// 	console.log('youtube client ready');
			// });
		};

		$window.checkAuth = function() {
			console.log('checkAuth: am i authorize?')
			gapi.auth.authorize(
			{
				client_id: clientId,
				scope: scopes,
				immediate: true
			},
			$window.handleAuthResult);
		}

		$window.handleAuthResult = function(authResult) {
			  var authorizeButton = document.getElementById('authorize-button');
			  if (authResult && !authResult.error) {
			    authorizeButton.style.visibility = 'hidden';
			    console.log('handleAuthResult: i can now make API call')
			  } else {
			  	console.log('handleAuthResult: i need user authorization')
			    authorizeButton.style.visibility = '';
			    authorizeButton.onclick = handleAuthClick;
			  }
		};

		$window.handleAuthClick = function(event) {
			console.log('authbutton clicked: now authorize')
			gapi.auth.authorize(
			{
				client_id: clientId,
				scope: scopes,
				immediate: true
			},
			$window.handleAuthResult);
			return false;
		}

		// lastly: dynamically load gapi js 
		var head	= document.getElementsByTagName('head')[0];
		var script	= document.createElement('script');
		script.type = 'text/javascript';
		script.src 	= 'https://apis.google.com/js/client.js?onload=gapiInit';
		head.appendChild(script);
		
	}

	angular
	 	.module('app.import')
	 	.run(['$window', '$log', YTRun])
		.factory('YTService', ['$log','$http', '$q', 'gapi', 'TrackService', YTService]);

})();