/*globals require module */
module.exports = (function (odata) {
  "use strict";

  var contentType = {
        JSON: "JSON",
        Text: "Text"
      },

      contentTypeStrings = {
        JSON: "application/json;charset=utf-8",
        Text: "text/plain;charset=utf-8"
      },

      addHeaders = function (response, type) {
        var responseHeaders = {
              "DataServiceVersion": "1.0;",
              "Cache-Control": "no-cache"
          },
          contentTypeString = contentTypeStrings.JSON;

        Object.keys(responseHeaders).forEach(function (header) {
          response.setHeader(header, responseHeaders[header]);
        });

        if (type in contentType) {
          contentTypeString = contentTypeStrings[type];
        }

        response.setHeader("Content-Type", contentTypeString);
      },

      respondJson = function (data, response, statusCode, debug) {
        var jsonSpace = debug? "  ": jsonSpace;

        if (statusCode) {
          response.statusCode = statusCode;
        }
        addHeaders(response);
        response.end(JSON.stringify(data, null, jsonSpace));
      },

      respondText = function (data, response) {
        addHeaders(response, contentType.Text);
        response.end(data);
      };

  return {
    processODataRequest: function (request, response) {
      var data = odata.get(request.url),
          statusCode;

      if (data === undefined) {
        console.log("Error with URL: " + request.url);
      }
      if (data.d) {
        respondJson(data, response, statusCode);
      }
      else if (data.error) {
        statusCode = 404;
        respondJson(data, response, statusCode);
      }
      else { 
        // $count, $value -- what if $value has property 'd'?
        respondText(data.toString(), response);
      }
    }
  };

})(require("./OData.js"));
