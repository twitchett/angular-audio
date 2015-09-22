(function () {
	
	'use strict';

	/* 
	app structure:

	app module
		- UserService
		- UserModel
		- TrackService
		- TrackModel
		- app.import
			- ImportController
			- ImportSCService
			- ImportYTService
		- app.library 
			- LibraryController
		- app.external
			- SC, _
		- logEnhancerProvider
	*/

	angular.module('app', [
		// angular modules
		'ngRoute',
		'ngResource',

		// external libraries/components encapsulated as an angular module (SC, underscore, etc)
		'app.external',

		// custom app modules
		'app.import',
		'app.library'
		//'app.version'
	])

	// config block
	.config(['$routeProvider', 'logEnhancerProvider', function($routeProvider, logEnhancerProvider) {

		// configure routing (note: individual routing configs are set in controllers)
		$routeProvider
			.otherwise({
				redirectTo: '/library'
			});

		// configure log enhancer - nothing to put here yet
	}])

	.constant('PROPERTIES', {
		'CONFIGS' : '/app/config.json' 	// relative path to app-level config file
	});

})();