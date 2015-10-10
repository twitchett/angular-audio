(function () {

	'use strict';

	/*
	* Import controller for SoundCloud content
	*/ 
	function ImportSCController($log, $scope, scService, scAuthService, trackService, trackFactory) {

		var log			= $log.getInstance('ImportSCController'),
			vm 			= this;

		var IMPORT_STATUS = {
			SUCCESS : 'success',
			FALIURE : 'failure',
			NONE 	: 'none' 
		}

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
			if (track.getImportStatus() === IMPORT_STATUS.NONE) {
				track.selected = !track.selected;
			}
		}

		// called on select-all checkbox change
		function selectAll() {
			vm.tracks.map(function(item) {
				//return angular.extend(item, { selected : vm.selectAllVd } ) --- testing
				if (item.getImportStatus() === IMPORT_STATUS.NONE) {
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
					track.setImportStatus(IMPORT_STATUS.SUCCESS);
				},
				function(response) {
					log.error('import one error ' , response)
					track.setImportStatus(IMPORT_STATUS.FAILURE);
				});
			}
		}

		function importAll() {
			console.log('calling trackservice saveall...')
			var selected = vm.tracks.filter(selectedFilter);

			trackService.saveAll(selected).then(function(data) {
				// replace models with new ones or just set flag?
				selected.map(function(item) {
					item.setImportStatus(IMPORT_STATUS.SUCCESS);
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

	// angular config
	angular
		.module('app.import.sc')
		.config(['$routeProvider', function($routeProvider) {
			$routeProvider.when('/import/sc', {
				controller: 'ImportSCController'
			});
		}])
		.controller('ImportSCController', ['$log', '$scope', 'SCService', 'SCAuthService', 'TrackService', 'TrackFactory', ImportSCController]);

})();