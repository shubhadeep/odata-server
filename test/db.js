/*globals module require */
module.exports = (function () {
  "use strict";

  var dbData = require("./v2/data.json");

  return {
    getData: function () {
      return dbData;

    },
    setData: function (data) {
      dbData = data;
    }

  };
})();
