/*globals module require */
module.exports = (function () {
  "use strict";

  var db = require("./db.js"),
      edm = require("./edm.js"),
      url = require("url");

  return {
    getResourcePathFromUrl: function (urlPath) {
      if (urlPath.indexOf("/") === 0) {
        return urlPath.split("/").splice(1).join("/");
      }

      return urlPath;
    },

    get: function (requestUrl) {
      var urlParts = url.parse(requestUrl, true),
          resourcePath = this.getResourcePathFromUrl(urlParts.pathname),
          payload;

      if (resourcePath === "") {
        payload = this.getEntitySetsPayload();
      }
      else if (resourcePath in edm.getEntitySets()) {
        payload = this.getEntitySetPayload(resourcePath);
      }
      else {
        payload = this.getNotFoundPayload(resourcePath);
      }
      return payload;
    },

    getEntitySetPayload: function (entitySet) {
      var data = db.getData(),
          entitySetData = [], // Empty - in case not in DB
          entityType;

      if (entitySet in data) {
        entitySetData = data[entitySet];
      }

      entityType = edm.getTypeForEntitySet(entitySet);
      return this.getBody(entitySetData, entityType);
    },

    removeNameSpace: function (name) {
      return name.split(".").pop();
    },

    getEntitySetsPayload: function () {
      return {
        d: {
          EntitySets: edm.getEntitySetNames()
        }
      };
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

    getBody: function (items, type) {
      var body = {},
          metadataAdder = this.getMetadataAdder(type);

      body.d = items.map(metadataAdder, this);
      console.log(type);
      return body;
    },

    getMetadataAdder: function (type) {
      return function (item) {
        var itemKey = item[type.key];
        console.log(type.properties[type.key].type);
        if (type.properties[type.key].type === "String") {
          itemKey = "'" + itemKey + "'";
        }
        item.__metadata = {
            uri: "/" + this.removeNameSpace(type.typeName) + "(" + itemKey + ")",
            type: type.typeName
          };
        return item;
      };
    }
  };
})();
