(function () {

	'use strict';

	/*
	* Library Controller
	*/
	function LibraryController($log, $scope, trackService) {

		var logger = $log.getInstance('LibraryController');

		$scope.getLibrary = function() {
			trackService.getLibrary().then(function(data) {
				$scope.tracks = data;
			}, function(data) {
				// error
			});
		}

		// init
		$scope.getLibrary();
	}

	// angular config
	angular
		.module('app.library')
		.config(['$routeProvider', function($routeProvider) {
			$routeProvider.when('/library', {
				templateUrl: 'app/components/library/library.html',
				controller: 'LibraryController'
			});
		}])
		.controller('LibraryController', ['$log', '$scope', 'TrackService', LibraryController]);

})();