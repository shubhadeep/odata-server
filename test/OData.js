/*globals module require */
module.exports = (function () {
  "use strict";

  var db = require("./db.js"),
      edm = require("./edm.js"),
      odataUri = require("./odata-uri.js"),
      url = require("url");

  return {

    get: function (requestUrl) {
      var urlParts = url.parse(requestUrl, true),
          path = urlParts.pathname,
          processor = this.z.getSegmentProcessor(path);
          return processor()
    },

    z: {
      getSegmentProcessor: function (urlPath) {
        var segments = odataUri.parse(urlPath).segments,
            currentSegment;

        if (segments.error) {
          return this.notFoundProcessor;
        }

        for (var i = 0; i < segments.length; i++) {
          currentSegment = segments[i];
          if (currentSegment.type === odataUri.segmentType.ServiceRoot) {
            return this.entityListProcessor;
          }
          else if (currentSegment.type === odataUri.segmentType.Collection) {
            return this.collectionProcessor;
          }
        }
        return this.notFoundProcessor;
      },

      getEntitySetPayload: function (entitySet) {
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
        return this.getBody(entitySetData, entityType);
      },

      getBody: function (items, type) {
        var body = {},
            metadataAdder = this.getMetadataAdder(type);

        body.d = items.map(metadataAdder, this);
        console.log(type);
        return body;
      },

      getMetadataAdder: function (type) {
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
      },

      entityListProcessor: function () {
        console.log("entityListProcessor");
        return {
          body: {
            d: {
              EntitySets: edm.getEntitySetNames()
            }
          }
        };
      },

      collectionProcessor: function (segments) {
        var collection = segments[0],
            payloadGetter = this.getEntitySetPayload;

        return {
          body: payloadGetter(collectionSegment)
        };
      },

      notFoundProcessor: function (segment) {
        console.log("notFoundProcessor");
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
      }
    }
  };
})();
