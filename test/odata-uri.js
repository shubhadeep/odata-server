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

      errorStrings = {
        CountAsRootError: "The request URI is not valid, the segment $count cannot be applied to the root of the service."
      },

      isCollection = function (segment) {
        return edm.getEntitySetNames().indexOf(segment) > -1;
      },

      isCount = function (segment) {
        return (segment === "$count");
      },

      isRawValue = function (segment) {
        return (segment === "$value");
      },

      parseSegments = function (previous, current) {
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
          console.log(arguments);
          if (previous.length === 0) {
            thisSegmentParsed.error = true;
            thisSegmentParsed.errorMessage = errorStrings.CountAsRootError;
          }
          else if (previousSegmentParsed && previousSegmentParsed.type !== segmentType.Collection) {
            thisSegmentParsed.error = true;
            // TODO handle if prvious is not collection, e.g. singleton, or $value
          }
        }

        if (thisSegmentParsed.type === segmentType.Unknown) {
          thisSegmentParsed.error = true;
        }

        previous.push(thisSegmentParsed);
        return previous;

      },

      getParsedSegments = function (segments) {
        var filteredSegments = segments.filter(
              function (segment) {
                return segment !== "";
              }),
            initialSegments = [];

        return filteredSegments.reduce(parseSegments, initialSegments);
      };

    return {
      segmentType: segmentType,
      getParsedSegments: getParsedSegments
    };
})(require("./edm.js"));
