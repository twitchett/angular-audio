# angular-audio

Organize and manage the tunes you listen to on Soundcloud and YouTube in one location. A work in progress!

## Backend

MongoDB, Mongoose 2.4, Express 4 & Node.js 2, authentication with Passport.

API endpoints:
HTTP GET /api/track/:id
HTTP POST /api/track
HTTP POST /api/tracks
HTTP DELETE /api/track/:id

Server:
- app.js 

Mongoose models:
- models/ 
	- user.js
	- track.js

Endpoints:
- routes/
	- api.js

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
Each module is a standalone component grouping functionally-related files. Each module consists of a js file containing the module declaration, and other components as necessary (services, controllers, models, etc).

#### Import Modules
Responsible for the import of tracks from external sources. Has two sub-modules: soundcloud-import and youtube-import. The services make requests to the external APIs, fetch data and return to the controllers.

#### Library

#### Track & User
Responsible for making requests to the backend

## To Dos

Minor:
- Error handling when authorization fails (soundcloud & youtube)
- Use server-side instead of client-side hook to set userdata on TrackModel before saving (on save and saveAll)

Major:
- Change backend so all mongoose calls use promiss (/routes/api.js)
- Persist SoundCloud authCode and access token in database (/routes/scservice.js)
- TrackFactory: Figure out optimal way to check for track duplication at front end (in import window)
- Upgrade to Node.js 3
- Automated testing ;)