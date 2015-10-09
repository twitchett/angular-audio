(function () {

	'use strict';

	/*
	* Library Controller
	*/
	function LibraryController($log, $scope, $modal, libraryService, trackService, filterFilter, typeFilter) {
		console.log('in LibraryController')

		var log	= $log.getInstance('LibraryController'),
			vm	= this,
			loadSize = 10,
			appliedFilters = {};

		var typeFilters = {
			src : {
				yt : true,
				sc : true
			},
			tags 	: []
		}

		//console.log('LC calling GL whaaat');
		getLibrary();
		vm.tracks = [], vm.subtracks = [], vm.displaytracks = [];

		// $scope.$watch('vm.subtracks', function(data) {
		// 	console.log('vm.subtracks changed --> displaytracks ')
		// 	vm.displayTracks = vm.subtracks;
		// });

		// state
		vm.typeFilters	= typeFilters;
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
		vm.lazyLoad 	= lazyLoad;
		vm.doTextFilter = doTextFilter;
		vm.doTypeFilter = doTypeFilter;

		function getLibrary() {
			libraryService.getLibrary().then(
			init,
			function(error) {
				console.error('Controller getLibrary() got error: ', error)
			// error
			});
		}

		function init(data) {
			vm.tracks = data;
			vm.displayTracks = vm.tracks.slice(0, loadSize);
			vm.subtracks 	 = angular.copy(vm.tracks);
			console.log('Controller getLibrary() got ' + data.length + ' tracks', data);
			//$scope.$apply();
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

		function lazyLoad() {
			//lazyLoadIdx += 10;
			var nextIdx = lazyLoadIdx + 10;
			var numToLoad = loadSize;
			if (nextIdx >= $scope.tracks.length) {
				numToLoad = $scope.tracks.length - lazyLoadIdx;
				nextIdx = $scope.tracks.length;
			}
			vm.loadedTracks = vm.loadedTracks.concat(vm.tracks.slice(lazyLoadIdx, numToLoad));
			lazyLoadIdx += numToLoad;
		}

		function doTypeFilter() {
			var start_length = vm.subtracks.length;
			var newTracks = typeFilter(vm.tracks, typeFilters);
			var end_length = vm.subtracks.length;
			//console.log('typeFilter over ' + start_length + ' tracks --> ' + end_length + ' (' + typeFilters.src.yt + '/' + typeFilters.src.sc + ')' );
			
			applyFilter('type', newTracks);
		}

		function doTextFilter(filterText) {

			var newTracks = filterFilter(vm.tracks, filterText);
			
			applyFilter('text', newTracks);
		}

		function applyFilter(name, filteredData) {
			console.log(name + ' ==> appliedFilters : ' + filteredData.length);
			appliedFilters[name] = filteredData;

			var newData = filteredData;
			console.log('newData initial length ' + newData.length);
			for (var filter in appliedFilters) {
				if (appliedFilters.hasOwnProperty(filter) && filter != name) {
					newData = _.intersection(newData, appliedFilters[filter]);
					console.log('after intersection with filter ' + filter + ':' + newData.length);
				}
			}

			if (newData.length == filteredData.length) {
				delete appliedFilters[name];
			}

			console.log('appliedFilters ', appliedFilters);

			vm.displayTracks = newData;
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
		return function(tracks, typeFilters) {
			var filtered = [];

			angular.forEach(tracks, function(track, idx) {
				if (typeFilters.src[track.src] === true) {
					if (!track.origIdx) track.origIdx = idx;
					filtered.push(track);
				}
			});

			return filtered;
		}
	}

	function LazyLoad() {
		return {
			restrict: 'A',
			link: function($scope, elem) {
				var scroller = elem[0];
				$(scroller).bind('scroll', function() {
					if (scroller.scrollTop + scroller.offsetHeight >= scroller.scrollHeight) {
						$scope.$apply('lib.lazyLoad()')
					}
				})
			}
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
		.controller('LibraryController', ['$log', '$scope', '$modal', 'LibraryService', 'TrackService', 'filterFilter', 'typeFilterFilter', LibraryController])
		.filter('typeFilter', TypeFilter)
		.directive('lazyLoad', LazyLoad);
})();