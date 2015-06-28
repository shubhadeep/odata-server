module.exports = (function () {
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