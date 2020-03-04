var tokenReceived = false;
var access_token = "";
var refresh_token = "";
var xhr = new XMLHttpRequest();
var currentId = "";

var trackDuration = 0;
var currentTimeInTrack = 0;
var timeoutVar;

var playState = false; // false if paused, true if currently playing

function msTimeProcessor(msTime) {
  let ret = "";
  ret += Math.floor(msTime/60000) + ":";
  if(Math.floor((msTime%60000)/1000) < 10) {
    ret += "0";
  }
  ret +=  Math.floor((msTime%60000)/1000);
  return ret;
}

function updateTimeRange() {
  currentTimeInTrack += 1000;
  console.log(currentTimeInTrack);
  $('#time').val(currentTimeInTrack);
  $("#currentTime").text(msTimeProcessor(currentTimeInTrack));
}

function changeAttributes(e) {
  if (xhr.readyState == 4 && xhr.status == 200) {
    var response = JSON.parse(xhr.responseText);
    $("#art_img").attr('src', response.album.images[0].url);

    trackDuration = response.duration_ms;
    console.log(trackDuration);
    $("#currentTime").text("0:00");
    $("#trackDuration").text(msTimeProcessor(trackDuration));
    //$("#trackDuration").text(Math.floor(trackDuration/60000) + ":" + Math.floor((trackDuration%60000)/1000));
    $("#time").attr("max", trackDuration);
    $("#time").val(0);

    console.log("attributes updated");
  }
}

xhr.onreadystatechange = changeAttributes; // see player_state_changed listener

window.onSpotifyWebPlaybackSDKReady = () => {

  var socket = new WebSocket('ws://localhost:555/');
  socket.onopen = function () {
      socket.send('token');
  };
  socket.onmessage = function (event) {
      try {
        if(JSON.parse(event.data).access !== undefined) {
          access_token = JSON.parse(event.data).access;
          refresh_token = JSON.parse(event.data).refresh;
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
  player.addListener('player_state_changed', ({paused, track_window, track_window: {current_track}}) => {

    if(paused && playState) {
      console.log("stop")
      clearInterval(timeoutVar);
      $("#play").attr("class", "text-secondary");
      $("#pause").attr("class", "text-white");
      playState = false;
    } else if (!paused && !playState) {
      console.log("start")
      timeoutVar = setInterval(updateTimeRange, 1000);
      $("#play").attr("class", "text-white");
      $("#pause").attr("class", "text-secondary");
      playState = true;
    }

    if(currentId !== current_track.id) {
      currentId = current_track.id;
      $("#artist").text(current_track.artists[0].name);
      $("#track").text(current_track.name);
      xhr.open('GET', "https://api.spotify.com/v1/tracks/"+currentId, true);
      xhr.setRequestHeader("Authorization", "Bearer "  + access_token);
      xhr.send();
    }



  });



  // Ready
  player.addListener('ready', ({ device_id, current_track }) => {
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

  $( "#time" ).on("change", function(event) {
    currentTimeInTrack = parseInt($(this).val(), 10);
    player.seek(currentTimeInTrack).then(() => {
      //$("#currentTime").text(Math.floor(currentTimeInTrack/60000) + ":" + Math.floor((currentTimeInTrack%60000)/1000));
      $("#currentTime").text(msTimeProcessor(currentTimeInTrack));
      console.log('Changed at position ' + currentTimeInTrack);
    });
  });

  $("#playpause").click(function(){
    player.togglePlay().then(() => {
      var time = 0;
      player.getCurrentState().then(state => {
        let time = state.position;
      });
    });
  });
  $("#connect").click(function() {
    console.log("Requested connection");
  });



};
