# angular-audio

Angular module structure:

```
module: app
  - module: app.import
    - controller
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
