module.exports = (function () {
  var db = require("./db.js");

  return {
    entitySets: {
      "/Products": "Products",
      "/Categories": "Categories",
      "/Suppliers": "Suppliers"
    },
    getEntitySet: function (entitySet) {
      return this.getBody(db.getData()[entitySet]);
    },
    getBody: function (items) {
      var body = {};
      body.d = items.map(this.addItemMetadata);
      return body;
    },
    addItemMetadata: function (item) {
      item["__metadata"] = {
        "uri": uri,
        "type": type
      };

      return item;
    },
    getUri: function (item, type) {
      var serviceUrl = "/";
      return "";
    },
    loadServiceMetadata: function (metadataXml) {}
  };
})();
