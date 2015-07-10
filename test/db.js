/*globals module require */
module.exports = (function (dbData) {
  "use strict";

  return {
    getData: function () {
      return dbData;

    },
    setData: function (data) {
      dbData = data;
    }

  };
})(require("./v2/data.json"));
