/*globals module*/
module.exports = (function () {
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

      isCollection = function (segment, model) {
        return model.getEntitySetNames()
                    .indexOf(segment) > -1;
      },

      isCount = function (segment) {
        return (segment === "$count");
      },

      isRawValue = function (segment) {
        return (segment === "$value");
      },

      getSegmentType = function (segment, model) {
        var type = segmentType.Unknown; type = x.y;

        if (isCollection(segment, model)) {
          type = segmentType.Collection;
        }
        else if (isCount(segment)) {
          type = segmentType.Count;
        }
        else if (isRawValue(segment)) {
          type = segmentType.RawValue;
        }

        return type;
      },

      parseSegments = function (previous, current) {
        var previousSegmentParsed,
            thisSegmentParsed = {
              type: getSegmentType(current, this.model),
              segment: current,
              error: false
            };

        switch (thisSegmentParsed.type) {
          case segmentType.Collection:
            if (previousSegmentParsed) {
              thisSegmentParsed.error = true;
            }
            break;
          case segmentType.Count:
            if (previous.length === 0) {
              thisSegmentParsed.error = true;
              thisSegmentParsed.errorMessage = errorStrings.CountAsRootError;
            }
            else if (previousSegmentParsed && previousSegmentParsed.type !== segmentType.Collection) {
              thisSegmentParsed.error = true;
              // TODO handle if prvious is not collection, e.g. singleton, or $value
            }
            break;
          case segmentType.Unknown:
            thisSegmentParsed.error = true;
        }

        previous.push(thisSegmentParsed);
        return previous;

      },

      getParsedSegments = function (segments, model) {
        var filteredSegments = segments.filter(
              function (segment) {
                return segment !== "";
              }),

            initialSegments = [];

        return filteredSegments.reduce(
          parseSegments.bind({
            model: model
          }), initialSegments);
      };

    return {
      segmentType: segmentType,
      getParsedSegments: getParsedSegments
    };
})();
