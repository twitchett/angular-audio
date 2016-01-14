(function () {
	
	'use strict';

	angular.module('app', [
		// angular modules
		'ngRoute',
		'ngResource',

		// external libraries/components encapsulated as an angular module (SC, underscore, etc)
		'app.external',

		// custom app modules
		//'app.config',
		'app.user',
		'app.import',
		'app.import.yt',
		'app.import.sc',
		'app.library',
		'app.track',
		//'app.version'
		'app.logEnhancer',

		// third party stuff
		// bootstrap
		'ui.bootstrap'
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
	})
	.constant('CONST', {
		'ORIGIN' : {
			'YT' : 'yt',
			'SC' : 'sc'
		},
		'TRACK'	: {
			'IMPORT' : {
				'SUCCESS' 	: 'success',
				'FAILURE' 	: 'failure',
				'NONE'		: 'none'
			}
		}
	});


	angular
	 	.module('app')
		.provider('configService', function() {
			// default values can be set here
			var config = {};
			return {
				set: function (settings) {
					//alert('config received settings', settings);
					angular.extend(config, settings);
				},
				$get: function() {
					return config;
				}
			}
		});

// 		Example module with Config Service and a MainController
// angular.module('myApp', [])
//     .provider('configService', function () {
//     var options = {};
//     this.config = function (opt) {
//         angular.extend(options, opt);
//     };
//     this.$get = [function () {
//         if (!options) {
//             throw new Error('Config options must be configured');
//         }
//         return options;
//     }];
// })

})();

	console.log(angular.element(document));

	// angular.element(document).ready(function() {

	// 	var ajaxRequest = new XMLHttpRequest();
	// 	ajaxRequest.open('GET', '/app/config.json');
	// 	ajaxRequest.onload = function() {
	// 		if (ajaxRequest.status === 200) {
	// 			alert('got config via ajax');
	// 			angular
	// 				.module('app')
	// 				.config(['configProvider', function (configProvider) {
	// 					console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
	// 					configProvider.config(data);
	// 				}]);
	// 			angular.bootstrap('app', ['app']);
	// 		}
	// 	}
	// 	ajaxRequest.send();
	// })