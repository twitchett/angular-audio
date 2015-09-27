(function () {

	'use strict';

	angular
		.module('app.library', ['ngRoute', 'app.logEnhancer', 'app.user'])
		.constant('LIBRARY', function() {
			return {
				// TODO
			}
		});

})();