(function () {

	'use strict';

	/*
	* Library Controller
	*/
	function LibraryController($log, $scope, $modal, libraryService) {

		var log	= $log.getInstance('LibraryController'),
			vm	= this;

		vm.animationsEnabled = true;

		console.log('LC calling GL wht');
		getLibrary();

		vm.getLibrary = getLibrary;
		vm.openImport = openImport;

		function getLibrary() {
			libraryService.getLibrary().then(function(data) {
				vm.tracks = data;
				console.log('library got some tracks', data);
				//$scope.$apply();
			}, function(data) {
				// error
			});
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
					vm.tracks = getLibrary();
				},
				function () {
					vm.tracks = getLibrary();
					$log.info('Modal dismissed (with error?) at: ' + new Date());
				});
		};
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
		.controller('LibraryController', ['$log', '$scope', '$modal', 'LibraryService', LibraryController]);

})();