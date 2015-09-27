(function () {

	'use strict';

	/*
	* 
	*/
	function LibraryService($log, $q, $http, trackService) {

		var LibraryService = {};
		var log = $log.getInstance('LibraryService');

		var library = getLibrary(true);

		LibraryService.getLibrary = getLibrary;

		function getLibrary(refresh) {
			log.debug('getLibrary() ')
			if (refresh === false) return library; // do not resolve (!?)

			var q = $q.defer();
			if (!library || refresh) {
				log.debug('refreshing library')
				trackService.getAllTracks().then(function(response) {
					library = response;
					q.resolve(library);
				},
				function(response) {
					q.reject(response)
				});
			} else {
				q.resolve(library);
			}
			return q.promise;
		}
 
		return LibraryService;
	}

	angular
		.module('app.library')
		.factory('LibraryService', ['$log', '$q', '$http', 'TrackService', LibraryService]);

})();