//1.
var http = require('http');
var fs = require('fs');
const request = require('request');
var url = require('url');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 555 });

var accessToken = "";
var tokenReceived = true;
var tokenRequested = false;

wss.on('connection', function connection(wsi) {
  console.log("clients : " + wss.clients.size);
  wsi.on('message', function incoming(data) {
    console.log(data);
    wss.clients.forEach(function each(client) {
      if(data === "token" && tokenReceived) {
        tokenRequested = true;
      }
      else if (client !== ws && client !== wsi && client.readyState === WebSocket.OPEN && tokenRequested) {
          client.send(accessToken);
          console.log("token sent");
          tokenRequested = false;
      }
    });
  });
});

const ws = new WebSocket("ws://localhost:555");

var  cred;
fs.readFile("credentials.json", function(error, content) {
  cred = JSON.parse(content);
  return 0;
});
//2.
var server = http.createServer(function (req, resp) {
    //3.
    var url_parts = new url.URL("http://localhost" + req.url);
    if (url_parts.pathname === "/spotify") {
      fs.readFile("index.html", function (error, pgResp) {
        if (error) {
          resp.writeHead(404);
          resp.write('Contents you are looking are Not Found');
          return resp.end();
        } else {
          resp.writeHead(200, { 'Content-Type': 'text/html' });
          resp.write(pgResp);
          return resp.end();
        }

      }
    );

  }

    else if (url_parts.pathname === "/spotify/connect") {
        fs.readFile("credentials.json", function(error, content) {
        cred = JSON.parse(content);
        if (error) {
            console.log("error reading credentials");
        } else {
          resp.writeHead(302, {
            "Location": "https://accounts.spotify.com/authorize/?client_id=" + cred.client_id
                                  + "&redirect_uri=" + "http://localhost/spotify/callback" + "&response_type=code"
            //add other headers here...
          });
          resp.end();

        }
      });
    }

    else if (url_parts.pathname === "/spotify/callback") {
      var code = url_parts.searchParams.get('code');
      var query = new url.URL('https://accounts.spotify.com/api/token');
      var body_for_ws = "";
      query.searchParams.append('code', code);
      query.searchParams.append('client_id', cred.client_id);
      query.searchParams.append('client_secret', cred.client_secret);
      query.searchParams.append('redirect_uri', "http://localhost/spotify/callback");
      query.searchParams.append('grant_type', "authorization_code");
      request.post({url: "https://accounts.spotify.com/api/token",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        form : {
          code:code,
          client_id:cred.client_id,
          client_secret:cred.client_secret,
          redirect_uri:"http://localhost/spotify/callback",
          grant_type:"authorization_code"
        }
      },
         (error, res, body) => {
        if (error) {
          console.error(error);
          return;
        }
        resp.writeHead(302, {
          "Location": "http://localhost/spotify"
          //add other headers here...
        });
        resp.end();
        accessToken = body;
        tokenReceived = true;
        return 0;
      })
        return 0;

    }

    else if(req.url.indexOf('.js') != -1) {
        fs.readFile("." + req.url, function (error, data) {
            if (error) {
                resp.writeHead(404, {"Content-type":"text/plain"});
                resp.end("No Javascript Page Found.");
            } else{
                resp.writeHead(200, {'Content-Type': 'text/javascript'});
                resp.write(data);
                resp.end();
                console.log("ended 3");
            }

        });
    }
    else if(req.url.indexOf('.css') != -1) {
        fs.readFile("." + req.url, function (error, data) {
            if (error) {
                resp.writeHead(404, {"Content-type":"text/plain"});
                resp.end("No css Page Found.");
            } else{
                resp.writeHead(200, {'Content-Type': 'text/css'});
                resp.write(data);
                resp.end();
                console.log("ended 4");
            }

        });
      }
      else {
          //4.
          resp.writeHead(200, { 'Content-Type': 'text/html' });
          resp.write("URL unknown");
          resp.end();
          console.log("ended 5");
      }
});
//5.
server.listen(80);

console.log('Server Started listening on 80');
