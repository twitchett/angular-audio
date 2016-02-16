(function () {

	'use strict';

	/*
	* Library Controller
	*/
	function LibraryController($log, $scope, $modal, libraryService, trackService, scService) {

		var log	= $log.getInstance('LibraryController'),
			vm	= this;

		var filters = {
			src : {
				yt : true,
				sc : true
			}
		}

		var count = 0;

		// state
		vm.filters 			= filters;
		vm.order 			= 'name';
		vm.search 			= '';
		vm.expanded 		= false;
		vm.animationsEnabled = true;
		vm.controllersubtracks = $scope.subtracks;
		vm.hovered			= null;
		vm.hoveredNote 		= null;
		vm.tag 				= null;
		vm.filteredTags 	= [];
		vm.tagslist			= null;

		vm.note 			= '';
		vm.addNotePopoverUrl = 'addNotePopoverTemplate.html';
		vm.showNotePopoverUrl = 'showNotePopoverTemplate.html';

		// behaviour
		vm.getLibrary 		= getLibrary;
		vm.openImport 		= openImport;
		vm.selectTrack 		= selectTrack;
		vm.expand 			= expand;
		vm.editTrack 		= null;
		vm.deleteTrack 		= deleteTrack;
		vm.getSCNewLikes 	= getSCNewLikes;
		vm.hover 			= hover;
		vm.addTag 			= addTag;
		vm.toggleTag		= toggleTag;
		vm.addNote 			= addNote;
		vm.hoverNoteIcon 	= hoverNoteIcon;

		// just testing
		// $scope.$watch('subtracks', function(data) {
		// 	console.log('watched subtracks ', data);
		// });

		function init() {
			getLibrary();
			getTags();
		}

		function getLibrary() {
			libraryService.getLibrary().then(function(data) {
				vm.tracks = data;
				console.log('Controller getLibrary() got ' + data.length + ' tracks', data);
			}, function(error) {
				console.error('Controller getLibrary() got error: ', error)
				// error
			});
		}

		function getTags() {
			trackService.getTags().then(function(tags) {
				vm.taglist = tags;
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

		function hover(track) {
			vm.hovered = track._id;
		}

		function unhover() {
			console.log('unhovering')
			vm.hovered = null;
		}

		function addTag(track, tag) {
			var newTags = track.tags.concat([tag]);
			var param = { tags : newTags };

			console.log('sending tag data', param);

			trackService.update(track, param).then(function(updatedTrack) {
				$scope.subtracks[track.origIdx].tags = newTags;
				vm.tag = null;
			}, function(error) {
				vm.tag = null;
			});
		}

		function removeTag(track, tag) {
			var newTags = _.without(track.tags, tag);
			var param = { tags : newTags };

			trackService.update(track, param).then(function(updatedTrack) {
				$scope.subtracks[track.origIdx].tags = newTags;
			}, function(error) {
				// do nothing
			});
		}

		function toggleTag(tag) {
			var idx = vm.filteredTags.indexOf(tag);
			if (idx >= 0) {
				console.log('removing tag ', tag);
				vm.filteredTags.splice(idx, 1);
			} else {
				console.log('adding tag ', tag);
				vm.filteredTags.push(tag);
			}
		}

		function setRating(track, newRating) {
			console.log('setting rating');
			var param = { rating : newRating };
			trackService.update(track, param).then(function(updatedTrack) {
				$scope.subtracks[track.origIdx].rating = newRating;
			});
		}

		function hoverNoteIcon(track) {
			console.log('hovering note', track);
			vm.hoveredNote = track._id;
		}

		function unhoverNoteIcon() {
			console.log('unhovering note')
			vm.hoveredNote = null;
		}

		function addNote(track, newNote) {
			
			var param = { note : newNote };
			console.log('adding note', param);
			trackService.update(track, param).then(function(updatedTrack) {
				track.name = newNote;
				vm.note = '';
			});
		}

		function openImport(src) {
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
				//size 		: 'lg',
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

		function getSCNewLikes() {
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
		function expand(expand) {
			vm.expanded = expand;
			console.log('expanded: ' + vm.expanded)
		}

		init();
	}

	function TagFilter()  {
		return function(tracks, tags) {

			if (tags.length === 0) return tracks;

			var filtered = [];

			angular.forEach(tracks, function(track, idx) {
				var intersect = _.intersection(tags, track.tags);
				if (intersect.length > 0) {
					filtered.push(track);
				}
			});

			return filtered;
		}
	}

	function TypeFilter() {
		
		return function(tracks, filters) {

			// check if any filters are applied
			var hasFilter = false;

			for (var type in filters.src) {
				if (type === false) {
					hasFilter = true;
					break;
				}
			}

			if (!hasFilter) return tracks;

			// select tracks according to filter
			var filtered = [];

			angular.forEach(tracks, function(track, idx) {
				//console.log('checking type filter ' + count);
				count++;
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
		.filter('typeFilter', TypeFilter)
		.filter('tagFilter', TagFilter);
})();