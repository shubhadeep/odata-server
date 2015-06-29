/*globals module require */
module.exports = (function () {
  "use strict";

  var db = require("./db.js"),
      edm = require("./edm.js"),
      entitySets = edm.schema.entityContainer.entitySets;

  return {
    entitySets: entitySets,

    get: function (resourcePath) {
      if (resourcePath === "") {
        return {
          d: {
            EntitySets: Object.keys(edm.schema.entityContainer.entitySets)
          }
        };
      }
      if (resourcePath in entitySets) {
        return this.getEntitySet(resourcePath);
      }
      return this.getNotFoundPayload(resourcePath);
    },

    getNotFoundPayload: function (resourcePath) {
      return {
        error: {
          code: "",
          message: {
            lang: "en-US", // TODO i18n
            value: "Resource not found for the segment '" + resourcePath + "'."
          }
        }
      };
    },

    getEntitySet: function (entitySet) {
      var data = db.getData(),
          entitySetData = []; // Empty - in case not in DB

      if (entitySet in data) {
        entitySetData = data[entitySet]
      }
      return this.getBody(entitySetData);
    },

    getBody: function (items) {
      var body = {};
      body.d = items.map(this.addItemMetadata);
      return body;
    },

    addItemMetadata: function (item) {
      item.__metadata = {
        uri: uri,
        type: type
      };

      return item;
    },

    getUri: function (entityPath) {
      var serviceUrl = "/";
      return serviceUrl + entityPath;
    },

    loadServiceMetadata: function (metadataXml) {
      
    }
  };
})();
