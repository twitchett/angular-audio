(function () {

	'use strict';

	angular
		.module('app.library', ['ngRoute', 'app.logEnhancer', 'app.user', 'app.import.sc'])
		.constant('LIBRARY', function() {
			return {
				// TODO
			}
		});

})();