/* ---------------------------------------------------------/
*
* Passport authentication strategy configuration
*
* --------------------------------------------------------- */

(function (module) {

	'use strict'

	var logger = require('log4js').getLogger('ppAuthenentication'),
		passport = require('passport'),
        GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
        YoutubeV3Strategy = require('passport-youtube-v3').Strategy,
        BearerStrategy = require('passport-http-bearer'),
        User = require ('./models/user.js'),
        config = require('./config.json');

    /* 
    * Bearer Strategy: for our own users
    */

    var validateUser = function validateUser(user, callback) {
        if (!user) {
            return callback(null, false);
        }
        if (user.length === 0) {
            return callback(null, false);
        }
        return callback(null, user);
    }

    var bearerStrategy = new BearerStrategy((token, done) => {
        User.findByToken(token)
            .then
            (
                user => validateUser(user, done),
                err => done(err)
            )
            .catch(ex => done(ex));
    });

    passport.use(bearerStrategy);

    /*
    * YouTube Strategy (for linking YouTube accounts)
    */

    var youtubeStrategyOpts = {
        clientID        : config.gapi.client_id,
        clientSecret    : config.gapi.client_secret,
        callbackURL     : config.gapi.callback_url,
        scope           : [config.gapi.scopes]
    }

    var youtubeStrategyCallback = function youtubeStrategyCallback(accessToken, refreshToken, profile, done) {
        // TODO: add the youtube access token to the mongo user model

        // User.findOneAndUpdate(query, update, opts, function(err, user) {
        //     if (err)
        //         return done (err);
        //     if (!user)
        //         return done(null, false);
        //     return done (null, user);
        // });
    }

    passport.use(new YoutubeV3Strategy(youtubeStrategyOpts, youtubeStrategyCallback));

    // Authentication middleware that can be used to secure routes
    var tokenAuthentication = passport.authenticate('bearer', { session: false });
    var youtubeAuthentication = passport.authenticate('youtube', { failureRedirect: '/auth/error', session: false }); // auth route not yet defined


	module.exports.tokenAuthentication = tokenAuthentication;
	module.exports.youtubeAuthentication = youtubeAuthentication;

})(module);