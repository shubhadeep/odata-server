/*globals module*/
module.exports = (function (edm) {
  "use strict";

  var Edm = edm;

  // TODO Write a converter for metadata.xml to this schema structure.
  return {
    getEntitySets: function () {
      return this.schema.entityContainer.entitySets;
    },
    getEntitySetNames: function () {
      return Object.keys(this.schema.entityContainer.entitySets);
    },
    getTypeForEntitySet: function (entitySet) {
      var schema = this.schema,
          entitySets = schema.entityContainer.entitySets,
          entityTypeKey = entitySets[entitySet].entityType,
          entityType = schema.entityTypes[this.removeNameSpace(entityTypeKey)];

      entityType.typeName = entityTypeKey;
      return entityType;
    },
    removeNameSpace: function (name) {
      return name.split(".").pop();
    },
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
        },
        Category: {
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
          },
          Categories: {
            entityType: "ODataDemo.Category"
          }
        }
      }
    }

  };

})({
  Int32: "Int32",
  String: "String"
});
