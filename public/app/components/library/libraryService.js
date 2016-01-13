(function () {

	'use strict';

	/*
	* Service to fetch user's library from server.
	*/
	function LibraryService($log, $q, $http, trackService) {

		var LibraryService = {};
		var log = $log.getInstance('LibraryService');
		var _this = this;

		var library = [];
		LibraryService.getLibrary = getLibrary;

		/* 
		* Temp solution:
		* If refresh, get new library from server and return a promise.
		* Otherwise, just return lib.
		*
		* Everything about this is bad!!
		*/
		function getLibrary(refresh) {
			var lib = _this.library;

			if (refresh === false) {
				return lib; 
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
 
		return LibraryService;
	}

	angular
		.module('app.library')
		.factory('LibraryService', ['$log', '$q', '$http', 'TrackService', LibraryService]);

})();