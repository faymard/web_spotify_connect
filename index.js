var tokenReceived = false;
var token = "";
var xhr = new XMLHttpRequest();

function changeAttributes(e) {
  if (xhr.readyState == 4 && xhr.status == 200) {
    var response = JSON.parse(xhr.responseText);
    $("#art_img").attr('src', response.album.images[0].url);

    console.log("artwork updated");
  }
}

xhr.onreadystatechange = changeAttributes; // see player_state_changed listener

window.onSpotifyWebPlaybackSDKReady = () => {

  var socket = new WebSocket('ws://localhost:555/');
  socket.onopen = function () {
      console.log('Connected!');
      socket.send('token');
  };
  socket.onmessage = function (event) {
      try {
        if(JSON.parse(event.data).access_token !== undefined) {
          access_token = JSON.parse(event.data).access_token;
          tokenReceived = true;
          socket.send('token received !');
        }
      } catch (e) {
        console.log(e);
      } finally {

      }

  };
  socket.onclose = function () {
      console.log('Lost connection!');
  };
  socket.onerror = function () {
      console.log('Error!');
  };


  const player = new Spotify.Player({
    name: 'SpotiWeb',
    getOAuthToken: cb => { cb(access_token); }
  });

  // Error handling
  player.addListener('initialization_error', ({ message }) => { console.error(message); });
  player.addListener('authentication_error', ({ message }) => { console.error(message); });
  player.addListener('account_error', ({ message }) => { console.error(message); });
  player.addListener('playback_error', ({ message }) => { console.error(message); });

  // Playback status updates
  player.addListener('player_state_changed', ({track_window, track_window: {current_track}}) => {

    $("#artist").text(current_track.artists[0].name);
    $("#track").text(current_track.name);
    xhr.open('GET', "https://api.spotify.com/v1/tracks/"+current_track.id, true);
    xhr.setRequestHeader("Authorization", "Bearer "  + access_token);
    xhr.send();

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

  $( "#volume" ).on("change", function(event) {
    player.setVolume(event.target.value/100.0);
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
