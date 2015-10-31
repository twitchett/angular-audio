(function () {

	'use strict';

	/*
	* Constructor function for TrackModels. TrackService acts as factory for TrackModel creation.
	*
	* See: https://medium.com/opinionated-angularjs/angular-model-objects-with-javascript-classes-2e6a067c73bc
	*/
	function TrackModel(CONST) {

		var TrackModel = function(attrs) {

			angular.extend(this, {

				// backend properties (set by the server)
				_id			: null,		// id of the track in the database
				userId		: null, 	// id of the user

				// youtube tracks don't have this set
				duration	: '',

				rating		: null,
				ghost		: false, 

				// required backend attributes
				src 		: null,
				srcId		: null,
				name		: null,
				genre		: null,
				uploader	: null,
				src_url 	: null,
				stream_url	: null,
				img_url		: null,

				// ui-attributes: front end only
				ui : {
					importStatus : 'none',	// 'success', 'failed', or 'none'
					isSelected	 : false,
					active		 : false
				}
			});

			// apply incoming attrs to properties, then apply all to this track
			angular.extend(this, attrs);
		}

		TrackModel.prototype.getId = function() {
			return this._id; 
		}

		TrackModel.prototype.getSrcUrl = function() {
			if (this.src === CONST.ORIGIN.YT) {
				return "https://www.youtube.com/watch?v=" + this.srcId;
			}
			if (this.src === CONST.ORIGIN.SC) {
				return this.src_url;
			}
		}

		/*
		* Bad! set this as an attribute in TrackFactory
		*/
		TrackModel.prototype.getSrcIconUrl = function() {
			if (this.src === CONST.ORIGIN.YT) {
				return "/assets/images/icons/youtube-player-icon-24px.png";
			}
			if (this.src === CONST.ORIGIN.SC) {
				return "/assets/images/icons/soundcloud-icon-24px.png";
			}
		}

		TrackModel.prototype.setImportStatus = function(status) {
			this.ui.importStatus = status;
		}

		TrackModel.prototype.getImportStatus = function() {
			return this.ui.importStatus;
		}

		return TrackModel;

	};

	angular
		.module('app.track')
		.factory('TrackModel', ['CONST', TrackModel]);

})();