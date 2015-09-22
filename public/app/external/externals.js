'use strict';

angular.module('app.external', [])

// Underscore library
.factory('_', function() {
	if (window._)
		return window._;
	else
		return null;
})

// SoundCloud Javascript object
.factory('SC', function() {
	if (window.SC) 
		return window.SC; 	
	else 
		return null; 
})

// Google API Javascript client
.factory('gapi', function() {
	if (window.gapi)
		return window.gapi;
	else
		return null;
})