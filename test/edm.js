/*globals module*/
module.exports = (function (edmx) {
  "use strict";

  var Edm = edmx,
      schema = {
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
      },

      removeNameSpace = function (name) {
        return name.split(".").pop();
      },

      getNameSpace = function (name) {
        return name.split(".").shift();
      };

  // TODO Write a converter for metadata.xml to this schema structure.
  return {
    getEntitySets: function () {
      return schema.entityContainer.entitySets;
    },

    getEntitySetNames: function () {
      return Object.keys(this.getEntitySets());
    },

    getTypeForEntitySet: function (entitySet) {
      var entitySets = this.getEntitySets(),
          entityTypeKey = entitySets[entitySet].entityType,
          entityType = schema.entityTypes[removeNameSpace(entityTypeKey)];

      entityType.name = removeNameSpace(entityTypeKey);
      entityType.nameSpace = getNameSpace(entityTypeKey);

      return entityType;
    }

  };

})({
  Int32: "Int32",
  String: "String"
});
