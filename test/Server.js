/*globals require console */
(function (port) {
  "use strict";

  var http = require("http"),
      odata = require("./OData.js"),

      addHeaders = function (response) {
        var responseHeaders = {
              "Content-Type": "application/json;charset=utf-8",
              "DataServiceVersion": "1.0;",
              "Cache-Control": "no-cache"
            };

        Object.keys(responseHeaders).forEach(function (header) {
          response.setHeader(header, responseHeaders[header]);
        });
      },

      respondJson = function (data, response, statusCode, debug) {
        var jsonSpace;
        if (debug) {
          jsonSpace = "  ";
        }
        if (statusCode) {
          response.statusCode = statusCode;
        }
        addHeaders(response);
        response.write(JSON.stringify(data, null, jsonSpace));
        response.end();
      },

      requestListener = function (request, response) {
        var data = odata.get(request.url),
            statusCode;
        if (data.error) {
          statusCode = 404;
        }
        respondJson(data, response, statusCode);
      },

      server = http.createServer(requestListener),
      onListening = function () {
        console.log("Server listening on port " + port);
      };

  server.listen(port, onListening);

})(8000);
