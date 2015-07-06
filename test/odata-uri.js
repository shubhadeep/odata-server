/*globals require module*/
module.exports = (function (edm) {
  "use strict";

  var segmentType = {
        Collection: "Collection",
        Count: "Count",
        RawValue: "RawValue",
        CollectionItem: "CollectionItem",
        Property: "Property",
        NavigationProperty: "NavigationProperty",
        Unknown: "Unknown"
      },

      getParsedSegments = function (segments) {
        var filteredSegments = segments.filter(
          function (segment) {
            return segment !== "";
          }),

        parseError = false,

        isCollection = function (segment) {
          return edm.getEntitySetNames().indexOf(segment) > -1;
        },

        isCount = function (segment) {
          return (segment === "$count");
        },

        isRawValue = function (segment) {
          return (segment === "$value");
        };

    return filteredSegments.reduce(function (previous, current) {
      var previousSegmentParsed,
          thisSegmentParsed = {
            type: segmentType.Unknown,
            segment: current,
            error: false
          };

      if (current.length > 0) {
        previousSegmentParsed = previous[previous.length];
      }

      if (isCollection(current)) {
        thisSegmentParsed.type = segmentType.Collection;
        if (previousSegmentParsed) {
          thisSegmentParsed.error = true;
        }
      }

      else if (isCount(current)) {
        thisSegmentParsed.type = segmentType.Count;
        if (previous === undefined) {
          thisSegmentParsed.error = true;
          thisSegmentParsed.segment = "The request URI is not valid, the segment $count cannot be applied to the root of the service.";
        }
        else if (previousSegmentParsed && previousSegmentParsed.type !== segmentType.Collection) {
          thisSegmentParsed.error = true;
          // TODO handle if prvious is not collection, e.g. singleton, or $value
        }
      }

      if (thisSegmentParsed.type === segmentType.Unknown) {
        thisSegmentParsed.error = true;
      }

      if (thisSegmentParsed.error) {
        parseError = true;
      }

      previous.push(thisSegmentParsed);
      return previous;

    }, []);/* Start with empty list */
  };

  return {
    segmentType: segmentType,
    getParsedSegments: getParsedSegments
  };
})(require("./edm.js"));
