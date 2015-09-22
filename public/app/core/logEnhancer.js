(function () {

	'use strict';

	// http://stackoverflow.com/a/20751603

	function LogEnhancer() {

		// this.loggingPattern = '%s - %s: ';

		this.$get = function() {
			var loggingPattern = this.loggingPattern;

			return {
				enhanceAngularLog: function($log) {
					$log.getInstance = function(context) {
						return {
							log 	: enhanceLogging($log.log, context, loggingPattern),
							info 	: enhanceLogging($log.info, context, loggingPattern),
							warn 	: enhanceLogging($log.warn, context, loggingPattern),
							debug 	: enhanceLogging($log.debug, context, loggingPattern),
							error 	: enhanceLogging($log.error, context, loggingPattern),
						};
					};

					function enhanceLogging(loggingFunc, context, loggingtPattern) {
						return function() {
							var modifiedArguments = [].slice.call(arguments);
							modifiedArguments[0] = [ context + ' > '] + modifiedArguments[0];
							loggingFunc.apply(null, modifiedArguments);
						};
					}
				}
			}
		}
	}

	function LogEnhancerRun($log, logEnhancer) {
		logEnhancer.enhanceAngularLog($log);
	}

	angular
		.module('app')
		.provider('logEnhancer', [LogEnhancer])
		.run(['$log', 'logEnhancer', LogEnhancerRun]);
})();