/*globals module*/
module.exports = (function () {
  "use strict";

  var util = require("util"),
      segmentType = {
        Collection: "Collection",
        Count: "Count",
        RawValue: "RawValue",
        CollectionItem: "CollectionItem",
        Property: "Property",
        NavigationProperty: "NavigationProperty",
        Unknown: "Unknown"
      },

      errorStrings = {
        CountAsRootError: "The request URI is not valid, the segment $count cannot be applied to the root of the service.",
        CollectionNotLastSegmentError: "The request URI is not valid. Since the segment '%s' refers to a collection, this must be the last segment in the request URI. All intermediate segments must refer to a single resource."
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

      getSingleEntityRegex = function (model) {
        // TODO
        // Match Collection(value) or Collection(key=value) for any collection
        // get a list of collection, keyname, keytype and OR the above
        return new RegExp("^$");
      },

      isSingleEntity = function (segment, model) {
        return getSingleEntityRegex(model).test(segment);
      },

      getSegmentType = function (segment, model) {
        var type = segmentType.Unknown;

        if (isCollection(segment, model)) {
          type = segmentType.Collection;
        }
        if (isSingleEntity(segment, model)) {
          type = segmentType.CollectionItem;
        }
        else if (isCount(segment)) {
          type = segmentType.Count;
        }
        else if (isRawValue(segment)) {
          type = segmentType.RawValue;
        }

        return type;
      },

      UpdateCollectionSegmentErrors = function (previousSegmentParsed, thisSegmentParsed) {
        var errorMessage;

        if (previousSegmentParsed) {
          thisSegmentParsed.error = true;
          if (previousSegmentParsed.type === segmentType.Collection) {
            previousSegmentParsed.error = true;
            previousSegmentParsed.errorMessage = util.format(errorStrings.CollectionNotLastSegmentError, previousSegmentParsed.segment);
          }
        }
      },

      getLastParsedSegment = function (parsedSegments) {
        return parsedSegments ? parsedSegments[parsedSegments.length - 1]: undefined
      },

      parseSegments = function (previous, current) {
        var previousSegmentParsed = getLastParsedSegment(previous),
            thisSegmentParsed = {
              type: getSegmentType(current, this.model),
              segment: current,
              error: false,
              errorMessage: ""
            };

        switch (thisSegmentParsed.type) {
          case segmentType.Collection:
            UpdateCollectionSegmentErrors(previousSegmentParsed, thisSegmentParsed);
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
