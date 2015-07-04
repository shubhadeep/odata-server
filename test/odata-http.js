/*globals require module */
module.exports = (function (odata) {
  "use strict";

  var addHeaders = function (response) {
        var responseHeaders = {
              "Content-Type": "application/json;charset=utf-8",
              "DataServiceVersion": "1.0;",
              "Cache-Control": "no-cache"
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
        response.end(JSON.stringify(data, null, jsonSpace));
      };

        Object.keys(responseHeaders).forEach(function (header) {
          response.setHeader(header, responseHeaders[header]);
        });
      };

  return {
    processODataRequest: function (request, response) {
      var data = odata.get(request.url),
          statusCode;
      if (data.error) {
        statusCode = 404;
      }
      respondJson(data, response, statusCode);
    }
  };

})(require("./OData.js"));
