(function () {

	'use strict';

	/*
	* Import controller
	*/ 
	function ImportController($log, $scope, scService, trackService) {

		var logger	= $log.getInstance('ImportController'),
			vm		= this;

		$scope.connect = function() {
			scService.connect().then(function(data) {
				console.log('data');
			},
			function(error){
				alert('unable to connect to soundcloud account', err)
			});
		}

		$scope.getLikes = function() {
			scService.getFavourites().then(function(data) {
				logger.debug('got number of tracks: ' + data.length)
				$scope.tracks = data;
			},
			function(error) {
				logger.error('got error when getting SC likes: ' + error);
			});
		}

		$scope.importAll = function() {
			trackService.saveAll($scope.tracks);
		}

		$scope.deleteAll = function() {
			trackService.deleteAll($scope.tracks);
		}
	}

	// angular config
	angular
		.module('app.import')
		.config(['$routeProvider', function($routeProvider) {
			$routeProvider.when('/import', {
				templateUrl: 'app/components/import/import.html',
				controller: 'ImportController'
			});
		}])
		.controller('ImportController',['$log', '$scope', 'SCService', 'TrackService', ImportController]);

})();