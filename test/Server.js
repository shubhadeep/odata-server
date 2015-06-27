(function (port) {
  "use strict";
  var http = require('http'),
      requestListener = function (request, response) {
        response.end("Test Web Server");
        console.log(request.url);
      },
      server = http.createServer(requestListener),
      onListening = function () {
        console.log("Server listening on port " + port);
      };

  server.listen(port, onListening);

})(8000);
