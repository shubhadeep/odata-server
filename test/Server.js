/*globals require console */
(function (port) {
  "use strict";

  var http = require("http"),
      odata = require("./OData.js"),

      respondJson = function (data, response, statusCode, debug) {
        var jsonSpace;

        if (debug) {
          jsonSpace = "  ";
        }

        if (statusCode) {
          response.statusCode = statusCode;
        }

        response.setHeader("Content-Type", "application/json;charset=utf-8");
        response.setHeader("DataServiceVersion", "1.0;");
        response.setHeader("Cache-Control", "no-cache");
        response.write(JSON.stringify(data, null, jsonSpace));
      },

      getResourcePath = function (urlPath) {
        if (urlPath.indexOf("/") === 0) {
          return urlPath.split("/").splice(1).join("/");
        }

        return urlPath;
      },

      requestListener = function (request, response) {
        var data = {},
            resourcePath = getResourcePath(request.url),
            statusCode;

        data = odata.get(resourcePath);

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
