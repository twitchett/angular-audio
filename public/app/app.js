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

		// quick & dirty authentication for all api requests
		$httpProvider.interceptors.push(function() {
			var interceptor = {};
			interceptor.request = function(config) {
				if (config.url.lastIndexOf('/api', 0) === 0) {
					config.headers.authorization = 'Bearer access_token_1234';
				}
				return config;
			}
			return interceptor;
		});

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
	})

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
