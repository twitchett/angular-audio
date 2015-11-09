(function () {
	
	'use strict';

	/*
	* main application module
	*/
	angular.module('app', [
		// angular modules
		'ngRoute',
		'ngResource',

		// external libraries/components encapsulated as an angular module (SC, underscore, etc)
		'app.external',

		// custom app modules
		'app.track',
		'app.user',
		'app.import',
		'app.import.yt',
		'app.import.sc',
		'app.library',
		//'app.version'
		'app.logEnhancer',

		// third party stuff
		'ui.bootstrap'
	])

	// config block
	.config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {

		// configure routing (note: individual routing configs are set in controllers)
		$routeProvider
			.otherwise({
				redirectTo: '/library'
			});

		// configure http bearer authorization header for all http requests
		// temporary - this just keeps the backend happy until user login is implemented
		// NOTE: case is important here! (Bearer not bearer)
		$httpProvider.defaults.headers.common.Authorization = 'Bearer access_token_1234';
	}])

	// 'global' constants used throughout app
	.constant('CONST', {
		'ORIGIN' : {
			'YT' : 'yt',	// key for youtube originated things
			'SC' : 'sc'		// key for soundcloud originated things
		},
		'TRACK'	: {
			'IMPORT' : {	
				'SUCCESS' 	: 'success',	
				'FAILURE' 	: 'failure',
				'NONE'		: 'none'
			}
		}
	});

	/*
	* Manually bootstrap application with data from server.
	* The data is available to app modules through the 'CONFIG' angular constant.
	*/
	angular.element(document).ready(function() {

		// manually retrieve the angular $http service
		var $http = angular.injector(['ng']).get('$http');

		// path to config file on server
		$http.get('/app/config.json').then(function(response) {
			// set as constant
			angular.module('app').constant('CONFIG', response.data);

			// now bootstrap application
			angular.bootstrap(document, ['app']);

		}, function(error) {
			// TODO: if the ajax fails, we need to retry or the app will not start!
		});
	});

})();
