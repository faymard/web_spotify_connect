//1.
var http = require('http');
var fs = require('fs');
const request = require('request');
var url = require('url');

var  cred;
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

    if(url_parts.searchParams.has('code')) {
      var code = url_parts.searchParams.get('code');

      request.post({url: "https://accounts.spotify.com/api/token",
        form : {
          code:code,
          client_id:cred.client_id,
          client_secret:cred.client_secret,
          redirect_uri:'http://localhost/spotify',
          grant_type:"authorization_code"
        }
      },
         (error, res, body) => {
        if (error) {
          console.error(error);
          return;
        }
        console.log(`statusCode: ${res.statusCode}`);
        console.log(body);

      })
    }


  }

    else if (req.url === "/spotify/connect") {
      fs.readFile("credentials.json", function(error, content) {
        cred = JSON.parse(content);
        if (error) {
            console.log("error reading credentials");
        } else {
          resp.writeHead(302, {
            "Location": "https://accounts.spotify.com/authorize/?client_id=" + cred.client_id
                                  + "&redirect_uri=" + "http://localhost/spotify" + "&response_type=code"
            //add other headers here...
          });
          resp.end();
          console.log("ended 2");

        }
      });
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
