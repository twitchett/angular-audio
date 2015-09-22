var express = require('express'),
	app = express(),
	router = express.Router(),
	log4js = require('log4js'),
	https = require('https'),
	ytService = require('./ytservice.js'),
	util = require('util');
	User = require ('../models/user.js');
	Track = require ('../models/track.js');

var	logger = log4js.getLogger();

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index');
});

router.get('/panel', function(req, res){

	//populate();

	Track.findByUserId(currentUser, function(err, tracks) {
		if (err) return logger.error(err);
		console.log(util.inspect(tracks));
		res.render('controlpanel', {
			title : 'Awesome music player coming up...',
			myplaylist : tracks
		});
	})
});

// adds a single track to the library
router.post('/add', function(req, res) {
	logger.info('server got /add request: '+ JSON.stringify(req.body));
	var id = req.body.id;

	if (req.body.src == 'yt') {
		ytService.getVideo(req, res, addTrackCb);
	} else if (req.body.src == 'sc') {
		// scService.getSound(id, addTrackCb)
	} else {
		res.end();
	}
});

// removes a single track from the library
router.get('/remove/:id', function(req, res) {
	logger.info('server got /remove request, id: '+ req.params.id);
	var id = req.params.id;
	Track.findByIdAndRemove(id, function(err, data){
		console.log('remove callback');
		if (err) {
			logger.error(err);
			res.writeHead(400, {'Content-Type': 'application/json'});
			res.end('{ "Reason"  : "Failed to remove track"}');
		} else {
			logger.info(data)
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.end(JSON.stringify(data));
		}
	});
	
});

router.post('/removeAll', function(req, res){
	logger.info('server got /removeAll request, ids: '+ req.body.ids);
	var ids = req.body.ids;
	
	// TODO
	// THIS DOESN'T WORK, all docs get removed
	// var conditions = [];
	// for (var i=0; i<ids.length; i++) {
	// 	conditions.push({ '_id' : ids[i] });
	// 	console.log('condition: ' + conditions[i]);
	// }
	// console.log('deleting these tracks: ' + util.inspect(conditions));
	// Track.remove(conditions, function(err, data){
	// 	if (err) logger.error(err);
	// 	if (data) logger.info('removed items ' + data);
	// })

	// temporary solution - remove docs one by one
	var cnt=0,
		total=ids.length;
	for (var i=0; i<ids.length; i++) {
		Track.findByIdAndRemove(ids[i], function(err, data){
			if (err) {
				logger.error(err); 
			} else {
				logger.info(data) // track which ids have been removed and inform client
			}
			cnt++;
			if (cnt==total) {
				res.writeHead(200, {'Content-Type': 'application/json'});
				res.end(JSON.stringify('{ "data" : "' + total + '" }'));
			}
		});
	}

});

function addTrackCb(err, track, res) {
	if (err) {
		return logger.error(err);
	} 
	if (track != null) {
		logger.info('server to panel: ' + JSON.stringify(track));
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.write(JSON.stringify(track));
	}
	res.end();
}

function addTracksCb(err, track, res) {
	if (err) {
		return logger.error(err);
	} 
	if (track != null) {
		// use Model.collection.insert() if v large
		track.save(function(err, data){
		 	if (err) return logger.error(err);
		 	console.dir(data);
		});
		logger.info('server to panel: ' + JSON.stringify(track));
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.write(JSON.stringify(track));
	}
	res.end();
}

function populate(){
	var user_lex = new User({
        username : 'leXXen'
    });
    user_lex.save(function(err, data){
        if (err) return console.error(err);
    });
   	var user_tabi = new User({
        username : 'tgoodall'
    });
    user_tabi.save(function(err, data){
        if (err) return console.error(err);
    });

    // give user a track
    var track1 = new Track({
        userId : user_lex._id,
        src : 'yt',
        srcId : 'bARGqKJrq5M',
        name :  'Jagwar Ma - Man I Need (Nicolas Rada Remix)'
    });
    track1.save(function(err, data){
        if (err) return console.error(err);
    });


    var track2 = new Track({
        userId : user_lex._id,
        src : 'yt',
        srcId : 'RyWE2D96yLg',
        name :  'Andy Caldwell - Melody Like A Drum (Wild Culture Remix)'
    });
    track2.save(function(err, data){
        if (err) return console.error(err);
    });

    var track3 = new Track({
    	userId : user_lex._id,
        src : 'yt',
        srcId : '5UGtwu64yQ4',
        name :  'UNKLE - Glow (Hybrid Remix)'
    })
    track3.save(function(err, data){
        if (err) return console.error(err);
    });

    var testTrack = new Track({
    	userId : user_tabi._id,
        src : 'yt',
        srcId : 'srcccc',
        name :  'track name'
    })
    testTrack.save(function(err, data){
        if (err) return console.error(err);
    });
}

module.exports = router;
