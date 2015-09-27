(function () {

	'use strict';

	/*
	* Import controller
	*/ 
	function ImportController($log, $scope, $modalInstance, scService, trackService, userService) {

		var log	= $log.getInstance('ImportController'),
			vm	= this;

		
		var states = {
			yt : {
				s0 : { 
					url  : 'app/components/import/import-0-start.html',
					next : 's1'
				},
				s1 : {
					url  : 'app/components/import/yt/import-1-yt.html',
					next : ''
				}
			}
		}

		// initial state: any s0 will do
		vm.state = states.yt.s0;

		vm.nextState = function(serviceCode) {
			var nextId = vm.state.next;
			vm.state = states[serviceCode][nextId];
			console.log('new state ', vm.state);
		}

		vm.getGreetingName = function(serviceCode) {
			// would be nice to have
		}

		vm.isConnected = function(serviceCode) {
			return userService.isAuthorized(serviceCode);
		}

		vm.connect = function(serviceCode) {

			userService.connect(serviceCode)
				.then(function(response) {
					log.info('authoriztion to ' + serviceCode + ' SUCCESSFUL')
				},
				function(response) {
					log.warn('authorization to ' + serviceCode + ' unsuccessful');
				});
		}

		vm.getSCTemp = function() {
			scService.getFavourites().then(function(scData) {
	
				trackService.saveAll(scData).then(function(tsData) {
					log.info('got tracks from soundcloud: ' + tsData.length);
				});
			},
			function(error) {
				log.error('got error when getting SC likes: ' + error);
			});
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
		.controller('ImportController',['$log', '$scope', '$modalInstance', 'SCService', 'TrackService', 'UserService', ImportController]);

})();