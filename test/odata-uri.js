/*globals module*/
module.exports = (function () {
  "use strict";

  var edm = require("./edm.js"),

      segmentType = {
        ServiceRoot: "ServiceRoot",
        Collection: "Collection",
        CollectionItem: "CollectionItem",
        Property: "Property",
        NavigationProperty: "NavigationProperty"
      },

      isServiceRoot = function (segments) {
        return (segments.length === 1 && segments[0] === "");
      },

      isCollection = function (segments) {
        return (segments[0] in edm.getEntitySets());
      },

      getSegments = function (urlPath) {
        var url_segments = urlPath.split("/").splice(1),
            segments = url_segments.map(function (x) {
              return {
                type: undefined,
                name: undefined
              };
            });
        
        if (isServiceRoot(segments)) {

        }
        else if (isCollection(segments)) {

        }
        if (url_segments.length === 1 && url_segments[0] === "") {

        }
        if (url_segments.length === 2) {
          if (url_segments[0] === "") {
            if (url_segments[1] === "") {
              segments[0].type = type: segmentType.ServiceRoot;
              return segments;
            }
            else if (url_segments[1] in edm.getEntitySets()) {
              segments[0] = {
                type: segmentType.Collection,
                name: url_segments[1]
              }
              return segments;
            }
          }
        }
      },
      getSegmentType: function (segment, previous) {
        var collectionItemRegex = /.*\(.*\)$/;
        if (previous === undefined) {
          // First segment

        }
      };

  return {
    segmentType: segmentType,
    parse: function (path) {
          error = false;

      return {
        segments: [
        ]
        error: error;
      }
    }
  };

})();