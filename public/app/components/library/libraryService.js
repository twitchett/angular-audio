(function () {

	'use strict';

	/*
	* 
	*/
	function LibraryService($log, $q, $http, trackService) {

		var LibraryService = {};
		var log = $log.getInstance('LibraryService');
		var _this = this;

		var library = [];
		LibraryService.getLibrary = getLibrary;

		function getLibrary(refresh) {
			var lib = _this.library;

			if (refresh === false) {
				console.log('returning _this, this, LibServ ', _this, this, LibraryService);
				return lib; // do not resolve (!?)
			}
			var q = $q.defer();
			if (!lib || refresh) {
				log.debug('refreshing library')
				trackService.getAllTracks().then(function(tracks) {
					_this.library = tracks;
					q.resolve(tracks);
				},
				function(error) {
					log.warn('logging error ', error);
					q.reject(error);
				});  // no error handler - controller will deal with it 
			} else {
				q.resolve(lib);
			}
			return q.promise;
		}

		// LibraryService.setLibrary = function(tracks) {
		// 	this.library = tracks;
		// 	log.info('setting library on: ', this)
		// }
 
		return LibraryService;
	}

	// Currently the LibraryController calls getLibrary() so is this actually needed?
	// function LibraryRun($log, trackService, libraryService) {
	// 	var log = $log.getInstance('LibraryRun');

	// 	trackService.getAllTracks().then(function(tracks) {
	// 		libraryService.setLibrary(tracks);
	// 	},
	// 	function(error) {
	// 		log.error('could not set library tracks: ', error)
	// 	});
	// }

	angular
		.module('app.library')
		//.run(['$log', 'TrackService', 'LibraryService', LibraryRun])
		.factory('LibraryService', ['$log', '$q', '$http', 'TrackService', LibraryService]);

})();