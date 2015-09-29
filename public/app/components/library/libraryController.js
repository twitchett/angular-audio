(function () {

	'use strict';

	/*
	* Library Controller
	*/
	function LibraryController($log, $scope, $modal, libraryService, trackService) {
		console.log('in LibraryController')

		var log	= $log.getInstance('LibraryController'),
			vm	= this;

		var filters = {
			src : {
				yt : true,
				sc : true
			},
			tags 	: []
		}

		vm.controllersubtracks = $scope.subtracks;

		$scope.$watch('subtracks', function(data) {
			console.log('watched subtracks ', data);
		});

		//console.log('LC calling GL whaaat');
		getLibrary();

		// state
		vm.filters 		= filters;
		vm.order 		= 'name';
		vm.search 		= '';
		vm.expanded 	= false;
		vm.animationsEnabled = true;

		// behaviour
		vm.getLibrary 	= getLibrary;
		vm.openImport 	= openImport;
		vm.selectTrack 	= selectTrack;
		vm.expand 		= expand;
		vm.editTrack 	= null;
		vm.deleteTrack 	= deleteTrack;

		function getLibrary() {
			libraryService.getLibrary().then(function(data) {
				vm.tracks = data;
				console.log('Controller getLibrary() got ' + data.length + ' tracks', data);
				//$scope.$apply();
			}, function(error) {
				console.error('Controller getLibrary() got error: ', error)
				// error
			});
		}

		function selectTrack($index, $event) {
			var track = $scope.subtracks[$index];
			console.log('selected: ' + track.name + ', origIdx ' + track.origIdx);
			//video.selected = !video.selected; 		---- testing
			if (track) track.selected = true;
		}

		function deleteTrack($index, $event) {
			$event.stopPropagation();
			var track = $scope.subtracks[$index];
			console.log($scope.subtracks.length + ' before, tracks ' + vm.tracks.length + ', deleting track ' + track.name);
			vm.tracks.splice(track.origIdx, 1);
			console.log('AFTER : ' + $scope.subtracks.length + ' subtracks ' + vm.tracks.length + ' tracks: ' );

		}

		function openImport() {
			var modalInstance = $modal.open({
				animation 	: true,
				templateUrl	: 'app/components/import/import.html',
				controller 	: 'ImportController as import',
				windowClass : 'modalFit',
				resolve 	: {
					items: function () {
						//
					}
				}
			});

			modalInstance.result.then(function (data) {
				$log.info('Modal dismissed at: ' + new Date());
				libraryService.getLibrary(true).then(function(tracks) {
					vm.tracks = tracks;
				});
			},
			function (error) {
				$log.info('Modal dismissed with error ', error);
				libraryService.getLibrary(true).then(function(tracks) {
					vm.tracks = tracks;
				});
			});
		};

		function expand(expand) {
			vm.expanded = expand;
			console.log('expanded: ' + vm.expanded)
		}
	}

	function TypeFilter() {
		return function(tracks, filters) {
			var filtered = [];

			angular.forEach(tracks, function(track, idx) {
				if (filters.src[track.src] === true) {
					track.origIdx = idx;
					filtered.push(track);
				}
			});

			return filtered;
		}
	}

	// angular config
	angular
		.module('app.library')
		.config(['$routeProvider', function($routeProvider) {
			$routeProvider.when('/library', {
				templateUrl: 'app/components/library/library.html',
				controller: 'LibraryController as lib'
			});
		}])
		.controller('LibraryController', ['$log', '$scope', '$modal', 'LibraryService', 'TrackService', LibraryController])
		.filter('typeFilter', TypeFilter);
})();