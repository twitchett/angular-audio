(function() {

	'use strict';

	describe('service: import SC', function() {
		var scService, $scope, $httpBackend, trackService, TrackModel, promiseHandler;
		
		beforeEach(module('app'));
		beforeEach(module('app.external'));
		beforeEach(module('app.import', function ($provide) {
			$provide.value('TrackService', {
				createNew	: jasmine.createSpy().and.callFake(function(input) {
								return new TrackModel();
							})
			});
		}));

		describe('with correct SC calls', function() {
			var mockSC;

			beforeEach(module('app.import', function ($provide) {
				$provide.value('SC', {
					connect		: jasmine.createSpy(),
					initialize 	: jasmine.createSpy(),
					get 		: jasmine.createSpy().and.callFake(function(url, opts, callback) {
										callback(fixtures.SCTracks);
								}),
					Helper		: { millisecondsToHMS : jasmine.createSpy() }
				});
			}));

			// all calls to module(...) must be made before inject()
			beforeEach(inject(function(_SCService_, _$rootScope_, _$httpBackend_, _SC_, _TrackService_, _TrackModel_) {
				scService 		= _SCService_;
				$scope 			= _$rootScope_;
				$httpBackend 	= _$httpBackend_;
				mockSC 			= _SC_;
				trackService 	= _TrackService_;
				TrackModel 		= _TrackModel_;
				promiseHandler 	= {
					success		: jasmine.createSpy('success'),
					failure		: jasmine.createSpy('failure')
				}
			}));

			it('authenticates the user and gets an oauth token', function() {
				// check initialization
				expect(mockSC.initialize).toHaveBeenCalledWith(jasmine.objectContaining({
					client_id 		: jasmine.anything(),
					redirect_uri 	: jasmine.anything()
				}));

				$httpBackend.whenGET('/sc/getOAToken').respond({
					data : 'OA_token'
				});

				// test
				scService.connect();

				// assert
				expect(mockSC.connect).toHaveBeenCalled();
				expect(scService.isConnected()).toBe(true);
			});

			it('gets the user\'s liked tracks', function(done) {
				// check initialization
				expect(mockSC.initialize).toHaveBeenCalledWith(jasmine.objectContaining({
					client_id 		: jasmine.anything(),
					redirect_uri 	: jasmine.anything()
				}));

				// test
				scService.getFavourites().then(promiseHandler.success, promiseHandler.failure);
				$scope.$digest();

				// verify methods called
				expect(promiseHandler.success).toHaveBeenCalled();
				expect(promiseHandler.failure).not.toHaveBeenCalled();

				// verify argument properties
				var args = promiseHandler.success.calls.mostRecent().args[0];  // not sure why the result is in array?
				expect(args.length).toBe(2);
				expect(args[0] instanceof TrackModel).toBe(true);
				expect(args[1] instanceof TrackModel).toBe(true);

				done();
			});


			it('returns an error if an authorized operation is called without authorization', function(done) {
				// check inialization
				expect(mockSC.initialize).toHaveBeenCalledWith(jasmine.objectContaining({
					client_id 		: jasmine.anything(),
					redirect_uri 	: jasmine.anything()
				}));

				// setup
				scService.disconnect();

				// test
				scService.getFavourites().then(promiseHandler.success, promiseHandler.failure);
				$scope.$digest();

				// verify methods called
				expect(promiseHandler.success).not.toHaveBeenCalled();
				expect(promiseHandler.failure).toHaveBeenCalled();

				done();
			});


			it('returns an error if the external call had an error', function(done) {
				// check inialization
				expect(mockSC.initialize).toHaveBeenCalledWith(jasmine.objectContaining({
					client_id 		: jasmine.anything(),
					redirect_uri 	: jasmine.anything()
				}));


				mockSC.get = jasmine.createSpy().and.callFake(function(url, opts, callback) {
					callback(null, '404 error');
				});

				// test
				scService.getFavourites().then(promiseHandler.success, promiseHandler.failure);
				$scope.$digest();

				// verify methods called
				expect(promiseHandler.success).not.toHaveBeenCalled();
				expect(promiseHandler.failure).toHaveBeenCalled();

				done();
			});

			it('only converts sounds of type "track"', function(done) {
				// check inialization
				expect(mockSC.initialize).toHaveBeenCalledWith(jasmine.objectContaining({
					client_id 		: jasmine.anything(),
					redirect_uri 	: jasmine.anything()
				}));

				// setup 
				var input = angular.copy(fixtures.SCTracks);
				input[0] = { obj : 'invalid object' };
				mockSC.get = jasmine.createSpy().and.callFake(function(url, opts, callback) {
					callback(input);
				});

				// test
				scService.getFavourites().then(promiseHandler.success, promiseHandler.failure);
				$scope.$digest();

				// verify methods called
				expect(promiseHandler.success).toHaveBeenCalled();
				expect(promiseHandler.failure).not.toHaveBeenCalled();

				var args = promiseHandler.success.calls.mostRecent().args[0];  // not sure why the result is in array?
				expect(args.length).toBe(1);
				expect(args[0] instanceof TrackModel).toBe(true);

				done();
			});

		});

	});


	// TODO: put this in a separate file or something...
	var fixtures = {
		SCTracks : [
		{
		    "kind": "track",
		    "id": 214510136,
		    "created_at": "2015/07/13 12:54:00 +0000",
		    "user_id": 12252171,
		    "duration": 483100,
		    "commentable": true,
		    "state": "finished",
		    "original_content_size": 8748185,
		    "last_modified": "2015/07/16 14:39:52 +0000",
		    "sharing": "public",
		    "tag_list": "\"Andre Crom & Chi Thanh\" \"Freedom Call feat. Jinadu\" \"dubspeeka Remix\" \"Off Recordings\"",
		    "permalink": "andre-crom-chi-thanh-freedom",
		    "streamable": true,
		    "embeddable_by": "all",
		    "downloadable": false,
		    "purchase_url": "http://www.beatport.com/release/freedom-call-remixes/1552545",
		    "label_id": null,
		    "purchase_title": null,
		    "genre": "",
		    "title": "Andre Crom & Chi Thanh - Freedom Call feat. Jinadu (dubspeeka Remix) [Off Recordings]",
		    "description": "<p>Following up on their original release, we are happy to present 3 excellent remixes for Andre Crom &amp; Chi Thanh’s “Freedom Call”, ...",
		    "label_name": "Off Recordings",
		    "release": "OFF115",
		    "track_type": "remix",
		    "key_signature": null,
		    "isrc": null,
		    "video_url": null,
		    "bpm": null,
		    "release_year": 2015,
		    "release_month": 7,
		    "release_day": 13,
		    "original_format": "mp3",
		    "license": "all-rights-reserved",
		    "uri": "https://api.soundcloud.com/tracks/214510136",
		    "user": {
		        "id": 12252171,
		        "kind": "user",
		        "permalink": "dubspeeka",
		        "username": "dubspeeka",
		        "last_modified": "2015/07/18 07:14:19 +0000",
		        "uri": "https://api.soundcloud.com/users/12252171",
		        "permalink_url": "http://soundcloud.com/dubspeeka",
		        "avatar_url": "https://i1.sndcdn.com/avatars-000111559936-g255u1-large.jpg"
		    },
		    "user_playback_count": 1,
		    "user_favorite": true,
		    "permalink_url": "http://soundcloud.com/dubspeeka/andre-crom-chi-thanh-freedom",
		    "artwork_url": "https://i1.sndcdn.com/artworks-000123100403-kgqrd7-large.jpg",
		    "waveform_url": "https://w1.sndcdn.com/Zhc2RaKgKEYp_m.png",
		    "stream_url": "https://api.soundcloud.com/tracks/214510136/stream",
		    "playback_count": 1826,
		    "download_count": 0,
		    "favoritings_count": 191,
		    "comment_count": 9,
		    "attachments_uri": "https://api.soundcloud.com/tracks/214510136/attachments",
		    "policy": "ALLOW",
		    "monetization_model": "NOT_APPLICABLE"
		},
		{
		    "kind": "track",
		    "id": 134774011,
		    "created_at": "2014/02/14 12:50:55 +0000",
		    "user_id": 1771,
		    "duration": 527696,
		    "commentable": true,
		    "state": "finished",
		    "original_content_size": 93251554,
		    "last_modified": "2015/07/07 12:08:42 +0000",
		    "sharing": "public",
		    "tag_list": "...",
		    "permalink": "a1-paskal-urban-absolutes-take",
		    "streamable": true,
		    "embeddable_by": "all",
		    "downloadable": false,
		    "purchase_url": "https://itunes.apple.com/de/album/lux-remixes-1-by-manuel-tur/id803192091",
		    "label_id": null,
		    "purchase_title": "iTunes",
		    "genre": "Deep House",
		    "title": "A1  -  Paskal & Urban Absolutes - Take The Fall Feat. Pete Josef (Manuel Tur Remix)",
		    "description": "Format: 12inch | Releasedate: 21.02.2014...",
		    "label_name": "Sonar Kollektiv",
		    "release": "SK272",
		    "track_type": "remix",
		    "key_signature": "",
		    "isrc": "",
		    "video_url": null,
		    "bpm": null,
		    "release_year": 2014,
		    "release_month": 2,
		    "release_day": 21,
		    "original_format": "wav",
		    "license": "all-rights-reserved",
		    "uri": "https://api.soundcloud.com/tracks/134774011",
		    "user": {
		        "id": 1771,
		        "kind": "user",
		        "permalink": "sonar-kollektiv",
		        "username": "Sonar Kollektiv",
		        "last_modified": "2015/07/17 12:11:17 +0000",
		        "uri": "https://api.soundcloud.com/users/1771",
		        "permalink_url": "http://soundcloud.com/sonar-kollektiv",
		        "avatar_url": "https://i1.sndcdn.com/avatars-000056806200-xawlw9-large.jpg"
		    },
		    "user_playback_count": 1,
		    "user_favorite": true,
		    "permalink_url": "http://soundcloud.com/sonar-kollektiv/a1-paskal-urban-absolutes-take",
		    "artwork_url": "https://i1.sndcdn.com/artworks-000070833761-nkt3zm-large.jpg",
		    "waveform_url": "https://w1.sndcdn.com/y1SmvW9VY59r_m.png",
		    "stream_url": "https://api.soundcloud.com/tracks/134774011/stream",
		    "playback_count": 22554,
		    "download_count": 0,
		    "favoritings_count": 725,
		    "comment_count": 33,
		    "attachments_uri": "https://api.soundcloud.com/tracks/134774011/attachments",
		    "policy": "ALLOW",
		    "monetization_model": "NOT_APPLICABLE"
		}]
	}

})();