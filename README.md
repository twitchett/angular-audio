# angular-audio

Organize and manage the tunes you listen to on Soundcloud and YouTube in one location. A work in progress!

This app was created because of a problem I have consistently run into over the past few years: forgetting music I've listened to and not being able to find it again. Ten years ago I had a local collection of mp3s on my hard drive, neatly organised in Winamp (RIP). Nowadays I listen almost exclusively on SoundCloud and Youtube (being a big fan of DJ sets and weird obscure tunes), and my collection is spread across a mess of playlists, favourites, links and bookmarks. It's not ideal. What I really want is something like a Winamp for my online streams...

So this is an attempt at a solution to the problem. It's also a means for me to explore new technologies and sharpen my JS skills, and have some fun along the way. :)

## Backend

The backend is built with MongoDB, Mongoose 2.4, Express 4 and Node.js 2. Track objects are stored in the database, and a RESTful (almost) API is exposed that allows CRUD operations on said objects. Passport is used for user authentication.

API endpoints:
- HTTP GET /api/track/:id
- HTTP POST /api/track
- HTTP POST /api/tracks
- HTTP DELETE /api/track/:id

Main file structure: 
- app.js 
- models/ 
	- user.js
	- track.js
- routes/
	- api.js
	- scservice.js

## Frontend

An AngularJS app which lives under /public. It has the following module structure (closely mapped by the file structure):

```
module: app
  - module: app.import
    - module: app.import.yt
      - authService
      - importService
      - controller
    - module: app.import.sc
      - authService
      - importService
      - controller
  - module: app.library
    - controller
    - service
  - module: app.track
    - model
    - service
    - factory
  - module: app.user
    - model
    - service
  - module: app.logEnhancer
  ```

### Modules
Each module is a self-contained component grouping functionally-related files together. Modules consists of a js file containing the module declaration, and other components as necessary (services, controllers, models, HTML pages, etc).

#### Import Modules
Responsible for the import of tracks from external sources. It has two sub-modules for SoundCloud and YouTube, respectively. The services perform authorization, make requests to the external APIs, fetch data and return TrackModels to the controllers, which is presented in the import wizard view.

#### Library Module
Responsible for presenting the library to the user and performing search, sort and track modification operations.

#### Track Module
Responsible for fetching track data from the back end. The REST API is consumed here. Provides the representation (model) of the track in the front end.

#### User Module
Provides the representation (model) of the user in the front end.

## To Dos

Minor:
- Error handling when authorization fails (soundcloud & youtube)
- Use server-side instead of client-side hook to set userdata on TrackModel before saving (on save and saveAll)
- Persist SoundCloud authCode and access token in database (/routes/scservice.js)

Major:
- Change backend so all mongoose calls use promiss (/routes/api.js)
- TrackFactory: Figure out optimal way to check for track duplication at front end (in import window)
- Implement some kind of cache in the front end for tracks
- Make stuff secure: http://alexbilbie.com/2014/11/oauth-and-javascript/
- Nicer graphics
- Automated testing ;)