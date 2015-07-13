/*globals require console */
/*eslint-disable no-console */
(function (port) {
  "use strict";

  var url = require("url"),
      util = require("util"),
      odataHttp = require("./odata-http.js"),
      faviconPath = "/favicon.ico",

      faviconResponse = function (response) {
        response.end();
      },

      requestListener = function (request, response) {
        var path = url.parse(request.url).pathname,
            errorMessage = "";

        if (path === faviconPath) {
          faviconResponse(response);
        }
        else {
          try {
            odataHttp.processODataRequest(request, response);
          }
          catch (e) {
            errorMessage = util.format("\n**** ERROR AT: %s ****\n%s", request.url, e.stack);
            console.error(errorMessage);
            response.statusCode = 500;
            response.end(errorMessage);
          }
        }
      },

      onListening = function () {
        console.log("Server listening on port " + port);
      };

  require("http").createServer(requestListener)
                 .listen(port, onListening);

})(8000);
