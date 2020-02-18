window.onSpotifyWebPlaybackSDKReady = () => {

  const player = new Spotify.Player({
    name: 'Web Playback SDK',
    getOAuthToken: cb => { cb(token); }
  });

  // Error handling
  player.addListener('initialization_error', ({ message }) => { console.error(message); });
  player.addListener('authentication_error', ({ message }) => { console.error(message); });
  player.addListener('account_error', ({ message }) => { console.error(message); });
  player.addListener('playback_error', ({ message }) => { console.error(message); });

  // Playback status updates
  player.addListener('player_state_changed', ({track_window, track_window: {current_track}}) => {
    console.log(track_window);

    $("#artist").text(current_track.artists[0].name);
    $("#track").text(current_track.name);

  });

  // Ready
  player.addListener('ready', ({ device_id }) => {
    console.log('Ready with Device ID', device_id);
  });

  // Not Ready
  player.addListener('not_ready', ({ device_id }) => {
    console.log('Device ID has gone offline', device_id);
  });

  // Connect to the player!
  player.connect();

  player.setVolume(0.5).then(() => {
    console.log('Volume updated!');
  });

  // Play/pause button
  $(document).ready(function(){
  });
  $("#playpause").click(function(){
    player.togglePlay().then(() => {
      var time = 0;
      player.getCurrentState().then(state => {
        let time = state.position;
      });
      console.log(time);
    });
  });
  $("#connect").click(function() {
    console.log("Requested connection");
  })


};
