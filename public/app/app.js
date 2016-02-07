(function () {
	
	'use strict';

	/*
	* main application module
	*/
	angular.module('app', [
		// angular modules
		'ngRoute',
		'ngResource',
		'ngCookies',

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

		function APIInterceptor($injector, $q) {
			var interceptor = {};

			interceptor.request = function APIInterceptor_request(config) {
				if (config && config.url && (config.url.lastIndexOf('/', 0) === 0))  {

					config.headers.authorization = 'Bearer access_token_1234';
				}
				return config;
			}

			return interceptor;
		}

		// quick & dirty authentication for all api requests
		$httpProvider.interceptors.push(APIInterceptor);

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

		var getConfig = function() {
			return $http.get('/app/config.json')
				.then(function(response)
				{
					angular.module('app').constant('CONFIG', response.data);
					return;
				}, function(error)
				{
					// TODO: if this fails, the app will not work!
					throw(error);
				})
		}

		// TODO: get token from cookie (or somewhere)

		var getUser = function() {
			return $http.get('/user', { headers: {'Authorization': 'Bearer access_token_1234' }})
				.then(function(response)
				{
					angular.module('app').value('UserData', response.data);
					return;

				}, function(error)
				{
					// if this fails, we have no logged in user, but the app will still work
					angular.module('app').value('UserData', null);
					return;
				});
			}

		var doBootstrap = function() {
			angular.bootstrap(document, ['app']);
		}

		getConfig().then(getUser).then(doBootstrap);

	});

})();
