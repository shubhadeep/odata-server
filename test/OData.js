/*globals module require */
module.exports = (function () {
  "use strict";

  var db = require("./db.js"),
      edm = require("./edm.js"),
      odataUri = require("./odata-uri.js"),
      url = require("url"),
      notFoundProcessor = function (segment) {
        return {
          body: {
            error: {
              code: "",
              message: {
                lang: "en-US", // TODO i18n
                value: "Resource not found for the segment '" + segment + "'."
              }
            }
          }
        };
      },
      entityListProcessor = function () {
        return {
          body: {
            d: {
              EntitySets: edm.getEntitySetNames()
            }
          }
        };
      },

      processSegment = function (previous, current) {
        switch (current.type) {
          case odataUri.segmentType.Collection: {
            return getEntitySetPayload(current.segment);
            break;
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
      },

      getErrorSegment = function (segments) {
        for (var index in segments) {
          if (segments[index].type === odataUri.segmentType.Unknown) {
            return segments[index].segment;
          }
        }
        return false;
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

      getBody = function (items, type) {
        var body = {},
            metadataAdder = getMetadataAdder(type);

        body.d = items.map(metadataAdder);
        return body;
      },

      getMetadataAdder = function (type) {
        var _removeNameSpace = function (name) {
          return name.split(".").pop();
        };

        return function (item) {
          var itemKey = item[type.key];
          if (type.properties[type.key].type === "String") {
            itemKey = "'" + itemKey + "'";
          }
          item.__metadata = {
              uri: "/" + _removeNameSpace(type.typeName) + "(" + itemKey + ")",
              type: type.typeName
            };
          return item;
        };
      };

  return {
    get: function (requestUrl) {
      var segments = url.parse(requestUrl, true)
                        .pathname.split("/"),
          parsedSegments = odataUri.getParsedSegments(segments),
          errorSegment;

      console.log("Request path: " + requestUrl + ", Segments: " + JSON.stringify(parsedSegments));

      if (parsedSegments.length === 0) {
        return entityListProcessor(); 
      }
      else {
        errorSegment = getErrorSegment(parsedSegments);

        if (errorSegment) {
          return notFoundProcessor(getErrorSegment(parsedSegments));
        }
        else {
          return processAllSegments(parsedSegments);
        }
      }
    }
  };
})();
