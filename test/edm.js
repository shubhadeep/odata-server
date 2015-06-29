/*globals module*/
module.exports = (function (edm) {
  "use strict";

  var Edm = edm;

  // TODO Write a converter for metadata.xml to this schema structure.
  return {
    schema: {
      namespace: "ODataDemo",
      entityTypes: {
        Product: {
          key: "ID",
          properties: {
            ID: {
              type: Edm.Int32,
              nullable: false
            },
            Name: {
              type: Edm.String,
              nullable: true
            }
          },
          navigationProperties: {

          }
        }
      },
      entityContainer: {
        name: "DemoService",
        metadata: {
          IsDefaultEntityContainer: true
        },
        entitySets: {
          Products: {
            entityType: "ODataDemo.Product"
          }
        }
      }
    }

  };

})({
  Int32: "Int32",
  String: "String"
});