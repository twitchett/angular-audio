(function () {

	'use strict';

	/*
	* Constructor function for TrackModels. TrackService acts as factory for TrackModel creation.
	*
	* See: https://medium.com/opinionated-angularjs/angular-model-objects-with-javascript-classes-2e6a067c73bc
	*/
	function TrackModel() {

		var self = this;

		// default properties
		var properties = {

			// backend properties (set by the server)
			_id			: null,		// id of the track in the database
			userId		: null, 	// id of the user

			// client id of the audio app in Soundcloud 
			//client_id	: '0f5fee2c8e7224eb0ebd32b5fa06fa7b', 	// TODO where is this used??

			// youtube tracks don't have this set, but need something for the front end
			duration	: '',

			rating		: 'unrated',
			ghost		: false, 

			// ui-attributes
			isSelected	: false,
			active		: false,

			// required backend attributes
			src 		: null,
			srcId		: null,
			name		: null,
			genre		: null,
			uploader	: null,
			stream_url	: null,
			img_url		: null,
		}

		var TrackModel = function(attrs) {
			// apply incoming attrs to properties, then apply all to this track
			angular.extend(this, angular.extend(properties, attrs));
		}

		TrackModel.prototype.getId = function() {
			return this._id; 
		}

		return TrackModel;

	};

	angular
		.module('app')
		.factory('TrackModel', [TrackModel]);

})();