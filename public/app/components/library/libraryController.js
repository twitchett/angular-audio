(function () {

	'use strict';

	/*
	* Library Controller
	*/
	function LibraryController($log, $scope, $modal, libraryService) {
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

		console.log('LC calling GL whaaat');
		getLibrary();

		// state
		vm.filters = filters;
		vm.order = 'name';
		vm.search = '';
		vm.expanded = false;
		vm.animationsEnabled = true;

		// behaviour
		vm.getLibrary = getLibrary;
		vm.openImport = openImport;
		vm.selectTrack = selectTrack;
		vm.expand = expand;

		function getLibrary() {
			libraryService.getLibrary().then(function(data) {
				vm.tracks = data;
				console.log('library got some tracks', data);
				//$scope.$apply();
			}, function(data) {
				// error
			});
		}

		function selectTrack($index, $event) {
			var track = vm.tracks[$index];
			console.log('selected: ', track);
			//video.selected = !video.selected; 		---- testing
			if (track) track.selected = true;
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
					filtered.push(track);
				}
			});

			return filtered;
		}
	}

	// angular config
	angular
		.module('app')
		.config(['$routeProvider', function($routeProvider) {
			$routeProvider.when('/library', {
				templateUrl: 'app/components/library/library.html',
				controller: 'LibraryController'
			});
		}])
		.controller('LibraryController', ['$log', '$scope', '$modal', 'LibraryService', LibraryController])
		.filter('typeFilter', TypeFilter);
})();