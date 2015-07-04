/*globals require console */
(function (port) {
  "use strict";

  var url = require("url"),
      faviconPath = "/favicon.ico",
      faviconResponse = function (response) {
        response.end();
      },
      requestListener = function (request, response) {
        var path = url.parse(request.url).pathname;

        if (path === faviconPath) {
          faviconResponse(response);
        }
        else {
          require("./odata-http.js").processODataRequest(request, response);
        }
        
      },

      onListening = function () {
        console.log("Server listening on port " + port);
      };

  require("http").createServer(requestListener)
                 .listen(port, onListening);

})(8000);
