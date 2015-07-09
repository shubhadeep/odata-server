/*globals module require console */
module.exports = (function () {
  "use strict";

  var util = require("util"),
      url = require("url"),
      db = require("./db.js"),
      edm = require("./edm.js"),
      odataUri = require("./odata-uri.js"),
      errorMessages = {
        ResourceNotFound: "Resource not found for the segment '%s'."
      },

      notFoundProcessor = function (segment, errorMessage, language, code) {
        var language = language || "en-US",
            code = code || "",
            errorMessage = errorMessage || util.format(errorMessages.ResourceNotFound, segment);

        return {
          error: {
            code: code,
            message: {
              lang: language,
              value: errorMessage
            }
          }
        };
      },

      entityListProcessor = function () {
        return {
          d: {
            EntitySets: edm.getEntitySetNames()
          }
        };
      },

      getErrorSegment = function (segments) {
        var error = {
              hasError: false,
              segment: "",
              errorMessage: ""
            };

        for (var index in segments) {
          error.hasError = segments[index].error;
          if (error.hasError) {
            error.segment = segments[index].segment;
            error.errorMessage = segments[index].errorMessage;
            break;
          }
        }
        return error;
      },

      getMetadataAdder = function (type) {
        var removeNameSpace = function (name) {
          return name.split(".").pop();
        };

        return function (item) {
          var itemKey = item[type.key];
          if (type.properties[type.key].type === "String") {
            itemKey = "'" + itemKey + "'";
          }
          item.__metadata = {
              uri: "/" + removeNameSpace(type.typeName) + "(" + itemKey + ")",
              type: type.typeName
            };
          return item;
        };
      },

      getBody = function (items, type) {
        var body = {},
            metadataAdder = getMetadataAdder(type);

        body.d = items.map(metadataAdder);
        return body;
      },


      getEntitySetPayload = function (entitySet) {
        var data = db.getData(),
            entitySetData,
            entityType;

        if (entitySet in data) {
          entitySetData = data[entitySet];
        }
        else {
          entitySetData = []; // Empty - in case not in DB
        }

        entityType = edm.getTypeForEntitySet(entitySet);
        return getBody(entitySetData, entityType);
      },

      processSegment = function (previous, current) {
        switch (current.type) {
          case odataUri.segmentType.Collection: {
            return getEntitySetPayload(current.segment);
          }
          case odataUri.segmentType.Count: {
            return previous.d.length;
          }
          case odataUri.segmentType.Property: {
            break;
          }
          default: {
            console.log("Unexpected Segment: " + current.segment);
          }
        }
        return previous;
      },

      processAllSegments = function (segments) {
        return segments.reduce(processSegment, {});
      };

  return {
    get: function (requestUrl) {
      var segments = url.parse(requestUrl, true)
                        .pathname.split("/"),
          parsedSegments = odataUri.getParsedSegments(segments),
          isEmptySegment = (parsedSegments.length === 0),
          errorSegment;

      console.log("Request path: " + requestUrl + ", Segments: " + JSON.stringify(parsedSegments));

      if (isEmptySegment) {
        return entityListProcessor();
      }

      errorSegment = getErrorSegment(parsedSegments);
      if (errorSegment.hasError) {
        return notFoundProcessor(errorSegment.segment, errorSegment.errorMessage);
      }

      return processAllSegments(parsedSegments);
    }
  };
})();
