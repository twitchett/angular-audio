(function () {

	'use strict';

	/*
	* Factory for the creation of TrackModels.
	* Responsible for providing other services with TrackModels. 
	*/
	function TrackFactory($log, libraryService, TrackModel) {

		var TrackFactory = {};
		var log = $log.getInstance('TrackFactory');

		TrackFactory.createNewForLibrary

		TrackFactory.convertAll = function(data) {
			var trackModels = [];
			angular.forEach(data, function(item, idx) {
				trackModels.push(new TrackModel(item));
			})
			return trackModels;
		}

		// Creates a TrackModel object from the given json
		TrackFactory.createNew = function(data) {
			var track = new TrackModel(data);

			// check if it already exists
			if (trackExists(track)) {
				//track.ui.importStatus = 'success';
				track.setImportStatus('success');
			}

			return track;
		}

		/*
		* TEMP IMPLEMENTATION: this really sucks and will not work with big libraries.
		* we also do not check the track's source.
		* better to send array of srcIds to server & use compound src + srcId index in db?
		*/
		var trackExists = function(track) {
			if (track != null && track.srcId != null) {

				var srcId = track.srcId;
				var lib = libraryService.getLibrary(false);

				for (var i = 0; i < lib.length; i++) {
					if (srcId.localeCompare(lib[i].srcId) == 0) return true;
				}
			}
			return false;
			
		}

		return TrackFactory;
	}

	angular
		.module('app')
		.factory('TrackFactory', ['$log', 'LibraryService', 'TrackModel', TrackFactory]);

})();