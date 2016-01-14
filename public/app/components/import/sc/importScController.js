(function () {

	'use strict';

	/*
	* Import controller for SoundCloud content
	*/ 
	function ImportSCController($log, $scope, scService, scAuthService, trackService, trackFactory, CONST) {

		var log			= $log.getInstance('ImportSCController'),
			vm 			= this;

		/* Set state-holding variables */

		if (!vm.tracks && isConnected()) getLikes(); 
		
		vm.selectAll 			= false;  			// model for "select all" playlists checkbox
		vm.connectErr 			= false;			// model for ng-switch connection error message
		vm.connected 			= isConnected(); 	// model for modal-body ng-switch

		/* Set functions */

		vm.getLikes 			= getLikes;
		vm.importOne 			= importOne;
		vm.importAll 			= importAll;
		vm.selectItem 			= selectItem;
		vm.selectAll 			= selectAll;
		vm.isConnected 			= isConnected;
		vm.connect 				= connect;

		function isConnected() {
			return scAuthService.isReady();
		}

		function connect() {
			scAuthService.connect().then(function() {
				vm.connectErr = false;
				vm.connected = true;
				getLikes();
			},
			function(errMsg) {
				vm.connectErr = true;
				vm.connected = false;
			});
		}

		function selectItem (index) {
			var track = vm.tracks[index];
			console.log(index + ' video selected: ', vm.tracks[index]);
			//video.selected = !video.selected; 		---- testing
			if (track.getImportStatus() === CONST.TRACK.IMPORT.NONE) {
				track.selected = !track.selected;
			}
		}

		// called on select-all checkbox change
		function selectAll() {
			vm.tracks.map(function(item) {
				//return angular.extend(item, { selected : vm.selectAllVd } ) --- testing
				if (item.getImportStatus() === CONST.TRACK.IMPORT.NONE) {
					return angular.extend(item, { selected : vm.selectAllVd } );
				}
			})
		}

		function getLikes() {
			scService.getFavourites().then(function(scTracks) {
				vm.tracks = scTracks;
			},
			function(error) {
				log.error('got error when getting SC likes: ' + error);
			});
		}

		function importOne($index, $event) {
			$event.stopPropagation();
			var track = vm.tracks[$index];
			if (track) {
				trackService.save(track).then(function(response) {
					log.info('import one success ' , response)
					track.setImportStatus(CONST.TRACK.IMPORT.SUCCESS);
				},
				function(response) {
					log.error('import one error ' , response)
					track.setImportStatus(CONST.TRACK.IMPORT.FAILURE);
				});
			}
		}

		function importAll() {
			console.log('calling trackservice saveall...')
			var selected = vm.tracks.filter(selectedFilter);

			trackService.saveAll(selected).then(function(data) {
				// is it enough to set import status on existing models,
				// or should all of them be replaced? currently replacing then setting flag
				selected.map(function(item) {
					item.setImportStatus(CONST.TRACK.IMPORT.SUCCESS);
				})
				$scope.$apply();
			},
			function(error) {
				log.error('save all error ' , error)
			});
		}

		function selectedFilter(item) {
			return item.selected;
		}
	}

	/*
	* angular module configuration
	*/
	angular
		.module('app.import.sc')
		.config(['$routeProvider', function($routeProvider) {
			$routeProvider.when('/import/sc', {
				controller: 'ImportSCController'
			});
		}])
		.controller('ImportSCController', ['$log', '$scope', 'SCService', 'SCAuthService', 'TrackService', 'TrackFactory', 'CONST', ImportSCController]);

})();