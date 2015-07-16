/*globals module require console */
module.exports = (function (db, edm, odataUri) {
  "use strict";

  var util = require("util"),
      url = require("url"),
      errorMessages = {
        ResourceNotFound: "Resource not found for the segment '%s'."
      },

  notFoundProcessor = function (segment, errorMessage, language, errorCode) {
    var lang = language || "en-US",
        code = errorCode || "",
        message = errorMessage || util.format(errorMessages.ResourceNotFound, segment);

    return {
      error: {
        code: code,
        message: {
          lang: lang,
          value: message
        }
      }
    };
  },

  entityListProcessor = function (model) {
    return {
      d: {
        EntitySets: model.getEntitySetNames()
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
        itemKey = util.format("'%s'", itemKey);
      }
      item.__metadata = {
          uri: util.format("/%s(%s)", removeNameSpace(type.typeName), itemKey),
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

  getEntitySetData = function (entitySet, database) {
    var data = database.getData(),
        entitySetData = []; // Empty - in case not in DB

    if (entitySet in data) {
      entitySetData = data[entitySet];
    }

    return entitySetData;
  },

  getEntitySetPayload = function (entitySet, model, database) {
    var entitySetData = getEntitySetData(entitySet, database),
        entityTypeInfo = model.getTypeForEntitySet(entitySet);

    return getBody(entitySetData, entityTypeInfo);
  },

  processSegment = function (previous, current) {
    switch (current.type) {
      case odataUri.segmentType.Collection: {
        return getEntitySetPayload(current.segment, edm, db);
      }
      case odataUri.segmentType.Count: {
        return previous.d.length;
      }
      case odataUri.segmentType.Property: {
        break;
      }
      default: {
        console.log(util.format("Unexpected Segment: %s", current.segment));
      }
    }
    return previous;
  },

  processAllSegments = function (segments) {
    return segments.reduce(processSegment, {});
  },

  get = function (requestUrl) {
    var segments = url.parse(requestUrl, true)
                      .pathname.split("/"),
        parsedSegments = odataUri.getParsedSegments(segments, edm),
        isEmptySegment = (parsedSegments.length === 0),
        errorSegment;

    console.log(
      util.format("Request path: %s, Segments: %s",
        requestUrl,
        JSON.stringify(parsedSegments)
        )
      );

    if (isEmptySegment) {
      return entityListProcessor(edm);
    }

    errorSegment = getErrorSegment(parsedSegments);
    if (errorSegment.hasError) {
      return notFoundProcessor(errorSegment.segment, errorSegment.errorMessage);
    }

    return processAllSegments(parsedSegments);
  };

  return {
    get: get
  };

})(require("./db.js"),
   require("./edm.js"),
   require("./odata-uri.js"));
