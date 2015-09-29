(function () {

	'use strict';

	angular
		.module('app.user', ['ngRoute', 'app.logEnhancer', 'app.import.sc', 'app.import.yt'])
		.constant('USER', function() {
			return {
				// TODO
			}
		});

})();