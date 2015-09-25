(function () {

	'use strict';

	/*
	* Factory for the creation of TrackModels
	*/
	function TrackFactory($log, libraryService, trackService, TrackModel) {

		var TrackFactory = {};
		var log = $log.getInstance('TrackFactory');

		// Creates a TrackModel object from the given json, but does not make a save (POST) request
		TrackFactory.createNew = function(data) {
			var track = new TrackModel(data);

			// check if it already exists
			if (trackExists(track)) {
				//track.ui.importStatus = 'success';
				track.setImportStatus('success');
			}

			return track;
		}

		// Creates a TrackModel object and makes a save (POST) request
		TrackFactory.createAndSaveNew = function(data) {
			var track = TrackService.createNew(data);
			return TrackService.save(track);
		}

		/*
		* temp implementation: this really sucks and will not work with big libraries.
		* better to send array of srcIds to server?
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
		.factory('TrackFactory', ['$log', 'LibraryService', 'TrackService', 'TrackModel', TrackFactory]);

})();