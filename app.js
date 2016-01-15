/* ---------------------------------------------------------/
*
* Angular-Audio app.js
*
* Express server configuration
*
* --------------------------------------------------------- */

(function (module) {

    'use strict'

    // dependencies
    var express = require('express'),
        path = require('path'),
        favicon = require('serve-favicon'),
        logger = require('morgan'),
        cookieParser = require('cookie-parser'),
        bodyParser = require('body-parser'),
        // database
        mongoose = require('mongoose'),
        User = require ('./models/user.js'),
        // passport 
        passport = require('passport'),
        GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
        YoutubeV3Strategy = require('passport-youtube-v3').Strategy,
        BearerStrategy = require('passport-http-bearer'),
        // routes
        // authRoute = require('./routes/auth.js'),
        scAuth = require('./routes/scAuth.js'),
        api = require('./routes/api.js'),
        // properties object
        config = require('./config.json');

    // configure mongoose: use native promises
    mongoose.Promise = global.Promise;

    // get the server
    var app = express();

    /* -------------- Set up passport authentication ----------- */

    var validateUser = function validateUser(user, callback) {
        if (!user) {
            return callback(null, false);
        }
        if (user.length === 0) {
            return callback(null, false);
        }
        return callback(user);
    }

    var bearerStrategy = new BearerStrategy((token, done) => {
        User.findByToken(token)
            .then(
                user => validateUser(user, done),
                err => done(err)
            ).catch(
                ex => done(ex)
            );
    });


    passport.use(bearerStrategy);

    // YouTube Strategy (for linking YouTube accounts)

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
    var youtubeAuthentication = passport.authenticate('youtube', { failureRedirect: '/auth/error', session: false }); // auth route not yet defined
    var tokenAuthentication = passport.authenticate('bearer', { session: false });

    /* -------------- Routing/middleware configuration ----------- */

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');

    // uncomment after placing your favicon in /public
    //app.use(favicon(__dirname + '/public/favicon.ico'));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(passport.initialize());
    // app.use('/auth', authRoute);
    app.use('/sc', scAuth);  // this route needs customized authentication: see routes/scservice.js 
    app.use('/api', tokenAuthentication, api);

    // catch 404 and forward to error handler
    app.use((req, res, next) => {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // Error Handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use((err, req, res, next) => {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });

    /* ---------------- Database configuration --------------- */

    var db = mongoose.connection;
    db.on('error', console.error);
    db.once('open', () => {
        console.log('connected to mongo :)');
    });

    mongoose.connect(config.db.url);

    /* --------------------------------------------------------- */

    module.exports = app;

})(module);