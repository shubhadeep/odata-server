/*globals require console */
(function (port) {
  "use strict";

  var requestListener = function (request, response) {
        require("./odata-http.js").processODataRequest(request, response);
      },

      onListening = function () {
        console.log("Server listening on port " + port);
      };

  require("http").createServer(requestListener)
                 .listen(port, onListening);

})(8000);
