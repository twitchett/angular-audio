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
        tokenAuthentication = require('./passportStrategies').tokenAuthentication,
        youtubeAuthentication = require('./passportStrategies').youtubeAuthentication,
        // routes
        // authRoute = require('./routes/auth.js'),
        scAuth = require('./routes/scAuth.js'),
        userRoutes = require('./routes/userRoutes.js'),
        tracksApi = require('./routes/api.js'),
        tagsApi = require('./routes/tagRoutes.js'),
        // properties object
        config = require('./config.json');

    // configure mongoose: use native promises
    mongoose.Promise = global.Promise;

    // get the server
    var app = express();

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
    app.use('/user', tokenAuthentication, userRoutes);
    app.use('/api', tokenAuthentication, tracksApi);
    app.use('/api', tokenAuthentication, tagsApi);

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
            console.error('in express error handler', err)
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