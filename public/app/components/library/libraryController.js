(function () {

	'use strict';

	/*
	* Library Controller
	*/
	function LibraryController($log, $scope, $modal, libraryService, trackService, scService) {
		console.log('in LibraryController')

		var log	= $log.getInstance('LibraryController'),
			vm	= this;

		var filters = {
			src : {
				yt : true,
				sc : true
			},
			tags : []
		}

		/* Assign state-holding variables */

		vm.filters 		= filters;
		vm.order 		= 'name';
		vm.search 		= '';
		vm.expanded 	= false;
		vm.animationsEnabled = true;
		vm.controllersubtracks = $scope.subtracks;

		/* Assign functions */

		vm.getLibrary 	= getLibrary;
		vm.openImport 	= openImport;
		vm.selectTrack 	= selectTrack;
		vm.expand 		= expand;
		vm.editTrack 	= null;
		vm.deleteTrack 	= deleteTrack;
		vm.getSCNewLikes = getSCNewLikes;

		// called upon controller load
		vm.init = function init() {
			getLibrary();
		}

		// testing filtering!
		$scope.$watch('subtracks', function(data) {
			//console.log('watched subtracks ', data);
		});

		var getLibrary = function getLibrary() {
			libraryService.getLibrary().then(function(data) {
				vm.tracks = data;
				console.log('Controller getLibrary() got ' + data.length + ' tracks', data);
				//$scope.$apply();
			}, function(error) {
				console.error('Controller getLibrary() got error: ', error)
				// error
			});
		}

		var selectTrack = function selectTrack($index, $event) {
			var track = $scope.subtracks[$index];
			console.log('selected: ' + track.name + ', origIdx ' + track.origIdx);
			//video.selected = !video.selected; 		---- testing
			if (track) track.selected = true;
		}

		var deleteTrack = function deleteTrack($index, $event) {
			$event.stopPropagation();
			var track = $scope.subtracks[$index];
			console.log($scope.subtracks.length + ' before, tracks ' + vm.tracks.length + ', deleting track ' + track.name);
			vm.tracks.splice(track.origIdx, 1);
			console.log('AFTER : ' + $scope.subtracks.length + ' subtracks ' + vm.tracks.length + ' tracks: ' );

		}

		// opens the import window, handled by the ImportXXController
		// src parameter should be 'yt' or 'sc' for YouTube and SoundCloud respectively
		var openImport = function openImport(src) {
			var tplUrl, ctrl;
			if (src === 'yt') {
				tplUrl = 'app/components/import/yt/import-yt.html';
				ctrl = 'ImportYTController as yt';
			}
			else if (src === 'sc') {
				tplUrl = 'app/components/import/sc/import-sc.html';
				ctrl = 'ImportSCController as sc';
			}
			var modalInstance = $modal.open({
				animation 	: true,
				templateUrl	: tplUrl,
				controller 	: ctrl,
				windowClass : 'modalFit',
				size 		: 'lg',
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

		// cheeky shortcut (temp)
		var getSCNewLikes = function getSCNewLikes() {
			console.log('getNewSCLikes');
			scService.getNewFavourites().then(function(tracks) {
				var modalInstance = $modal.open({
					animation 	: true,
					templateUrl	: 'app/components/import/sc/import-sc.html',
					controller 	: 'ImportSCController as sc',
					windowClass : 'modalFit',
					size	 	: 'lg',
					resolve 	: {
						items: function () {
							console.log('resolving items', tracks);
							return tracks; 
						}
					}
				});

				modalInstance.result.then(function (data) {
					$log.info('Modal dismissed at: ' + new Date());
					libraryService.getLibrary(true).then(function(tracks) {
						vm.tracks = tracks;
					});
				});
			},
			function(err) {
				console.err(err)
			})
		}

		// ???????????
		var expand = function expand(expand) {
			vm.expanded = expand;
			console.log('expanded: ' + vm.expanded)
		}

		/* Now initialize */
		vm.init();
	}

	/*
	* Filter: filter tracks by type (yt/sc)
	*/
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
		.controller('LibraryController', ['$log', '$scope', '$modal', 'LibraryService', 'TrackService', 'SCService', LibraryController])
		.filter('typeFilter', TypeFilter);
})();