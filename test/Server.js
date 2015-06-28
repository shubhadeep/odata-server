(function (port) {
  "use strict";
  var http = require('http'),
      odata = require("./OData.js"),

      requestListener = function (request, response) {
        var data = {};

        if (request.url in odata.entitySets) {
          data = odata.getEntitySet(odata.entitySets[request.url]);
        }

        RespondJson(data, response);

        console.log(request.url);
      },

      server = http.createServer(requestListener),
      onListening = function () {
        console.log("Server listening on port " + port);
      },
      RespondJson = function (data, response, debug) {
        var jsonSpace;

        if (debug) {
          jsonSpace = "  ";
        }
        response.setHeader("Content-Type", "application/json;charset=utf-8");
        response.setHeader("DataServiceVersion", "1.0;");
        response.setHeader("Cache-Control", "no-cache");
        response.write(JSON.stringify(data, null, jsonSpace));
      };

  server.listen(port, onListening);

})(8000);

