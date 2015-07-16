/*globals module require */
module.exports = (function (dbData) {
  "use strict";

  return {
    getData: function () {
      return dbData;

    },

    setData: function (data) {
      dbData = data;
    },

    getCollection: function (collectionName) {
      var collectionData = []; // Empty - in case not in DB

      if (collectionName in dbData) {
        collectionData = dbData[collectionName];
      }

      return collectionData;
    }

  };
})(require("./v2/data.json"));
