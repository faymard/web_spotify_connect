# web_spotify_connect
Spotify Connect receiver app. Use a valid Spotify Premium account or it won't work.

Requires NodeJS + npm.

# Setup
First, install all packages required (package.json has them all) with npm.

Then, credentials file has to be configured. There is a template file in the repo : you have to put in your own app credentials.
Get a look [here](https://developer.spotify.com/documentation/general/guides/app-settings/#register-your-app) to see how to get them.
Your app must have http://localhost/spotify AND http://localhost/spotify/callback as redirect URIs. You will get errors if it doesn't.
Once it's done, rename the template file as credentials.json (or the app won't find it) and it should be fine.

Ensure that nothing listens on port 80. I will add a port option to the app as soon as I can.

Finally, just launch the server with `node server.js` and connect to localhost/spotify.

There you go !

# Current features
Connect to the app via any Spotify client (PC, Android, iOS should work too but not tested yet). Music will then be played from the web page (be sure to enable sound output in your browser, some disable it by default).

Playback can be controlled from the app (play/pause, seek).

# Planned upgrade
Navigate through player queue and add/remove tracks from it.

Login to Spotify headlessly to use the app on an embedded client (e.g. a Raspberry Pi with no input device)

Explore user's library and use the app as a standalone client using Spotify Web API.

Search through Spotify's catalog.
